const express = require('express');
const axios = require('axios');
const app = express();

// Proxy para a Foto (Sua API mágica)
app.get('/api/proxy-image', async (req, res) => {
    try {
        const response = await axios({
            url: req.query.url,
            method: 'GET',
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (e) { res.status(500).send("Erro"); }
});

// Busca os dados completos
app.get('/api/info/:user', async (req, res) => {
    try {
        const user = req.params.user;
        // Buscando dados do Instagram
        const { data } = await axios.get(`https://www.instagram.com/${user}/?__a=1&__d=dis`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        
        const u = data.graphql.user;
        res.json({
            nome: u.full_name,
            bio: u.biography,
            seguidores: u.edge_followed_by.count,
            foto: `/api/proxy-image?url=${encodeURIComponent(u.profile_pic_url_hd)}`
        });
    } catch (e) { res.status(404).json({ erro: true }); }
});

module.exports = app;
