import { buildPedidoWhatsappMessage, calcularValorDomicilio } from './pedido-whatsapp';

describe('pedido-whatsapp', () => {
  const productos = [
    {
      producto_id: 1,
      nombre: 'Pan artesanal',
      precio_unitario: 3000,
      cantidad: 2,
      precio_total: 6000,
    },
  ];

  it('calcula domicilio base hasta 1 km', () => {
    expect(calcularValorDomicilio(0.5)).toBe(5000);
    expect(calcularValorDomicilio(1)).toBe(5000);
  });

  it('suma 2KCOP por cada km extra', () => {
    expect(calcularValorDomicilio(2)).toBe(7000);
    expect(calcularValorDomicilio(3)).toBe(9000);
  });

  it('incluye recogida en tienda sin costo de domicilio', () => {
    const msg = buildPedidoWhatsappMessage({
      nombre: 'Ana',
      productos,
      envioDomicilio: false,
    });
    expect(msg).toContain('Hola, soy Ana y mi pedido es:');
    expect(msg).toContain('2 Pan artesanal');
    expect(msg).toContain('Valor del domicilio: $0 — será recogido por el cliente');
    expect(msg).toContain('Valor a pagar:');
    expect(msg).not.toContain('5KCOP si no sobrepasa');
  });

  it('incluye domicilio con una sola ruta en el mensaje', () => {
    const msg = buildPedidoWhatsappMessage({
      nombre: 'Luis',
      productos,
      envioDomicilio: true,
      distanciaKm: 2,
      direccionEntrega: 'Cra 19, Santa Marta',
      coordenadasEntrega: { lat: 11.24, lng: -74.19 },
    });
    expect(msg).toContain('Dirección de entrega: Cra 19, Santa Marta — https://www.google.com/maps/dir/?api=1');
    expect(msg).toContain('origin=11.24,-74.19');
    expect(msg).toContain('destination=11.2119477,-74.18602');
    expect(msg).not.toContain('Coordenadas');
    expect(msg).not.toContain('Ruta de reparto');
    expect(msg).toContain('Valor del domicilio: $7.000');
    expect(msg).toContain('Valor a pagar: $13.000');
  });

  it('con GPS solo envía el enlace de ruta sin texto genérico', () => {
    const msg = buildPedidoWhatsappMessage({
      nombre: 'Ana',
      productos,
      envioDomicilio: true,
      distanciaKm: 1,
      direccionEntrega: 'Ubicación del dispositivo (GPS)',
      coordenadasEntrega: { lat: 11.2399, lng: -74.1951 },
    });
    expect(msg).toContain('Dirección de entrega: https://www.google.com/maps/dir/?api=1');
    expect(msg).not.toContain('Ubicación del dispositivo');
    expect(msg).not.toContain('Coordenadas');
  });
});
