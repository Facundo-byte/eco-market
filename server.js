const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { MercadoPagoConfig, Preference } = require('mercadopago');

dotenv.config();

const app = express();
const port = process.env.PORT || 4173;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/config', (_, res) => {
  res.json({
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || ''
  });
});

app.post('/api/create-preference', async (req, res) => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return res.status(500).json({
      message: 'Falta MERCADOPAGO_ACCESS_TOKEN en el entorno.'
    });
  }

  const cartItems = Array.isArray(req.body.items) ? req.body.items : [];

  if (cartItems.length === 0) {
    return res.status(400).json({ message: 'El carrito está vacío.' });
  }

  const items = cartItems.map((item) => ({
    title: item.name,
    quantity: Number(item.quantity || 1),
    unit_price: Number(item.price),
    currency_id: 'ARS'
  }));

  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        items,
        payer: {
          email: req.body.email || undefined
        },
        back_urls: {
          success: `${req.protocol}://${req.get('host')}/carrito.html?status=success`,
          failure: `${req.protocol}://${req.get('host')}/carrito.html?status=failure`,
          pending: `${req.protocol}://${req.get('host')}/carrito.html?status=pending`
        },
        auto_return: 'approved'
      }
    });

    return res.json({
      id: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point
    });
  } catch (error) {
    return res.status(500).json({
      message: 'No se pudo crear la preferencia de pago.',
      detail: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Eco-Market escuchando en http://localhost:${port}`);
});
