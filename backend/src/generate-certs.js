/**
 * Genera un certificado SSL auto-firmado para desarrollo local (HTTPS simulado).
 * Ejecutar: node src/generate-certs.js
 */
const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, '..', 'certs');
fs.mkdirSync(certsDir, { recursive: true });

console.log('Generando par de llaves RSA 2048...');
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{ name: 'commonName', value: 'localhost' }];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([
    { name: 'subjectAltName', altNames: [{ type: 2, value: 'localhost' }] }
]);

cert.sign(keys.privateKey, forge.md.sha256.create());

fs.writeFileSync(path.join(certsDir, 'key.pem'), forge.pki.privateKeyToPem(keys.privateKey), 'utf8');
fs.writeFileSync(path.join(certsDir, 'cert.pem'), forge.pki.certificateToPem(cert), 'utf8');

console.log('Certificado SSL auto-firmado generado en /certs/');
