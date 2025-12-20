import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import moment from 'moment';
import * as qs from 'qs'; // Xử lý query string
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  constructor(private userService: UsersService) {}

  // Cấu hình VNPAY
  private vnp_TmnCode = 'AFWWEE43';
  private vnp_HashSecret = '5A9DUYGGKS3C54Z1IUOMX7U7RILDP6JX';
  private vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private vnp_returnUrl = 'http://localhost:3000/payment/vnpay_return';

  createPaymentUrl(amount: number, userId: number, ipAddr: string) {
    const date = new Date();
    const createData = moment(date).format('YYYYMMDDHHmmss'); // Thời điểm tạo giao dịch
    const orderId = moment(date).format('DDHHmmss'); // Mã đơn hàng ngẫu nhiên => 1 mã - thanh toán 1 lần

    let vnp_Params: Record<string, string | number> = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = 'AFWWEE43';
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = `Nap tien cho trader ${userId}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100; // VNPAY xài hào nên x100
    vnp_Params['vnp_ReturnUrl'] = this.vnp_returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createData;

    vnp_Params = this.sortObject(vnp_Params); // Tạo chữ ký -> sắp a-z

    // Chữ ký: Toàn bộ tham số giao dịch + secret key VNPAY cấp
    // Quy tắc: encode thủ công + ký trên dữ liệu thô
    const signData = qs.stringify(vnp_Params, { encode: false }); // obj thành query string, ko encode do quy tắc
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex'); // hash (crypto xài binary nên cần chuyển về bytes)

    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl =
      this.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

    return paymentUrl;
  }

  private sortObject(
    obj: Record<string, string | number>,
  ): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
      sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, '+');
    }

    return sorted;
  }

  async handleVnPayReturn(query: Record<string, string>) {
    const secureHash = query.vnp_SecureHash; // Lấy chữ ký
    const queryObj = { ...query };
    delete queryObj['vnp_SecureHash']; // Xóa để ký lại
    delete queryObj['vnp_SecureHashType'];

    const vnp_Params = this.sortObject(queryObj);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      // https://sandbox.vnpayment.vn/apis/docs/bang-ma-loi/
      if (query['vnp_ResponseCode'] === '00') {
        //console.log('VNPAY Return Info:', query['vnp_OrderInfo']);
        const orderInfo = String(query['vnp_OrderInfo']);

        //const match = orderInfo.match(/trader[+\s%20]*(\d+)/i);
        const match = orderInfo.match(/(\d+)$/); //So cuoi chuoi
        //console.log('VNPAY Return TraderId:', match);
        if (!match) {
          console.error(
            'LỖI: Không tìm thấy User ID trong OrderInfo:',
            orderInfo,
          );
          return { code: '97', message: 'Invalid Order Info' };
        }
        const userId = Number(match[1]); // Lấy nhóm số bắt được
        const amount = Number(query['vnp_Amount']) / 100; // vnp xài hào (x100 trước đó)

        if (isNaN(userId)) {
          console.error('LỖI: User ID bị NaN');
          return { code: '97', message: 'Invalid User ID' };
        }

        console.log(`Tiến hành nạp tiền: User ${userId} - Số tiền ${amount}`);

        await this.userService.deposit(Number(userId), amount);

        return { code: '00', message: 'Success', amount };
      } else {
        return { code: '97', mesage: 'Fail (User Cancelled / Errorr)' };
      }
    } else {
      return { code: '99', message: 'Invalid Signature' };
    }
  }
}
