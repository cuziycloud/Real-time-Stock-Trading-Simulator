import { OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

@WebSocketGateway({cors: true})
export class EventsGateway implements OnGatewayInit {
    @WebSocketServer()
    import React from 'react'
    import renderer from 'react-test-renderer'
    import { Provider } from 'react-redux'
    
    import store from '~/store'
    import { events.gateway } from '../events.gateway'
    
    describe('<events.gateway />', () => {
      const defaultProps = {}
      const wrapper = renderer.create(
        <Provider store={store}>
         <events.gateway {...defaultProps} />
        </Provider>,
      )
    
      test('render', () => {
        expect(wrapper).toMatchSnapshot()
      })
    })
}
