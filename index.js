const express = require('express');
const axios = require('axios');
const path = require('path'); // Linha nova
const app = express();

// AQUI ESTÁ O SEGREDO: Essa linha faz o seu site aparecer!
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Proxy para a Foto
app.get('/api/proxy-image', async (req, res) => {
    try {
        const url = req.query.url;
        const imagem = await axios.get(url, { responseType: 'stream', headers: { 'User-Agent': 'Mozilla/5.0' } });
        res.setHeader('Content-Type', imagem.headers['content-type']);
        imagem.data.pipe(res);
    } catch (e) { res.status(500).send("Erro na foto"); }
});

// Busca os dados (Nome, Bio, Seguidores)
app.get('/api/info/:user', async (req, res) => {
    try {
        const user = req.params.user;
        const res_insta = await axios.get(`https://www.instagram.com/${user}/?__a=1&__d=dis`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const dados = res_insta.data.graphql.user;
        res.json({
            nome: dados.full_name,
            bio: dados.biography,
            seguidores: dados.edge_followed_by.count,
            foto: `/api/proxy-image?url=${encodeURIComponent(dados.profile_pic_url_hd)}`
        });
    } catch (e) { res.status(404).json({erro: "Não achei"}); }
});

module.exports = app;
