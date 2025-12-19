import { IsString } from 'class-validator';

export class VnpayReturnDto {
  @IsString()
  vnp_Amount: string;

  @IsString()
  vnp_BankCode: string;

  @IsString()
  vnp_OrderInfo: string;

  @IsString()
  vnp_ResponseCode: string; // 00 là thành công

  @IsString()
  vnp_SecureHash: string;

  @IsString()
  vnp_TxnRef: string;

  // Cho phép các trường khác nếu VNPAY trả về thêm mà ta chưa khai báo hết
  [key: string]: any;
}
