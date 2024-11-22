const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SOAP_URL = 'https://ec.europa.eu/taxation_customs/dds2/eos/validation/services/validation';

app.post('/api/validate-eori', async (req, res) => {
    const { eori } = req.body;

    if (!eori) {
        return res.status(400).json({
            error: '请提供 EORI 号码'
        });
    }

    try {
        console.log(`开始验证 EORI: ${eori}`);

        const soapRequest = `<?xml version='1.0' encoding='UTF-8'?>
            <soapenv:Envelope 
                xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                xmlns:eos="http://eori.ws.eos.dds.s/">
                <soapenv:Header/>
                <soapenv:Body>
                    <eos:validateEORI>
                        <eos:eori>${eori}</eos:eori>
                    </eos:validateEORI>
                </soapenv:Body>
            </soapenv:Envelope>`;

        console.log('发送 SOAP 请求:', soapRequest);

        const response = await axios({
            method: 'post',
            url: SOAP_URL,
            headers: {
                'Content-Type': 'text/xml;charset=UTF-8',
                'Accept': 'text/xml, text/html, application/xhtml+xml, */*',
                'SOAPAction': '""'
            },
            data: soapRequest,
            timeout: 10000
        });

        console.log('SOAP 响应:', response.data);

        const parser = new xml2js.Parser({
            explicitArray: false,
            ignoreAttrs: true
        });

        const result = await parser.parseStringPromise(response.data);
        const validationResult = result['S:Envelope']['S:Body']
            ['ns0:validateEORIResponse'].return.result;

        res.json({
            eori: validationResult.eori,
            status: validationResult.status === '0' ? 1 : 0,
            statusDescr: validationResult.status === '0' ? 'Valid' : 'Invalid',
            name: validationResult.name || '',
            address: validationResult.address || '',
            street: validationResult.street || '',
            postalCode: validationResult.postalCode || '',
            city: validationResult.city || '',
            country: validationResult.country || '',
            requestDate: result['S:Envelope']['S:Body']
                ['ns0:validateEORIResponse'].return.requestDate
        });

    } catch (error) {
        console.error('SOAP 请求错误:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(500).json({
            error: '验证服务暂时不可用，请稍后重试',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                response: error.response?.data
            } : undefined
        });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log('SOAP URL:', SOAP_URL);
});