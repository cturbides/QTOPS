import { DummyEvent, DummyHandler, DummyPublisher } from '../mocks';

describe('Domain Events', () => {
    it('debe invocar handlers suscritos', async () => {
        const pub = new DummyPublisher();
        const handler = new DummyHandler();
        pub.subscribe(handler);

        await pub.publish(new DummyEvent());
        expect(handler.called).toBe(true);
    });
});
