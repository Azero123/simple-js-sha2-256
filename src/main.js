

const max = Math.pow(2, 32)
const fast = typeof window === 'undefined'

const k =
    [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]

function rotr(x, n) {
    return (((x >>> n) | (x << 32 - n)) >>> 0) % max
}

const utf8 = function (str) {
    var i, l = str.length,
      output = new Array(16).fill(0)
    let current = 0
    for (i = 0; i < l; i += 1) {
        const r = i % 4
        if (r === 0) {
            current = 0
        }
        if (l !== i) {
            current += str.charCodeAt(i) << +(3 - r) * 8
        }
        else {
            current += 128 << +(3 - r) * 8
        }
        output[i/4 | 0] = current
    }
    return output
}

module.exports = function(m) { 
    const ln = m.length * 8
    const H = [1779033703, -1150833019, 1013904242, -1521486534, 1359893119, -1694144372, 528734635, 1541459225]
    const M = utf8(m);
    const leng = ((ln + 64 >> 9) << 4) + 15
    M[ln >> 5] |= 0x80 << (24 - ln % 32);
    M[leng] = ln;
    

    const w = new Array(leng)
    var a, b, c, d, e, f, g, h;

    for (var t = 0, len = M.length; t < len; t+=16) {
        if (M[t] === undefined) {
            M[t] = 0
        }
        a = H[0]
        b = H[1]
        c = H[2]
        d = H[3]
        e = H[4]
        f = H[5]
        g = H[6]
        h = H[7]

        for (let i = 0; i < 64; i++) {
            if (i <= 15) {
                w[i] = M[t + i] === undefined ? 0 : M[t + i];
            } else {
                const w15 = w[i-15]
                const w2 = w[i-2]
                const s0 = rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3) // sha256_Gamma0256
                const s1 = rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10) // sha256_Gamma1256
                w[i] = (w[i-16] + s0 + w[i-7] + s1) % max
            }
            const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)
            const ch = (e & f) ^ (~e & g)
            const temp1 = (h + S1 + ch + k[i] + w[i]) % max
            const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)
            const maj = (a & b) ^ (a & c) ^ (b & c)
            const temp2 = (S0 + maj) % max
    
            h = g
            g = f
            f = e
            e = (d + temp1) % max
            d = c
            c = b
            b = a
            a = (temp1 + temp2) % max
        }


        H[0] = (H[0] + a) % max
        H[1] = (H[1] + b) % max
        H[2] = (H[2] + c) % max
        H[3] = (H[3] + d) % max
        H[4] = (H[4] + e) % max
        H[5] = (H[5] + f) % max
        H[6] = (H[6] + g) % max
        H[7] = (H[7] + h) % max
    }
    H[0] = (H[0] + max) % max
    H[1] = (H[1] + max) % max
    H[2] = (H[2] + max) % max
    H[3] = (H[3] + max) % max
    H[4] = (H[4] + max) % max
    H[5] = (H[5] + max) % max
    H[6] = (H[6] + max) % max
    H[7] = (H[7] + max) % max

    
    let arr = []

    for (let i = 0; i < 8; i++) {
        const j = i * 4
        const item = H[i]
        arr[j] = (item >> 24) & 0xff
        arr[j + 1] = (item >> 16) & 0xff
        arr[j + 2] = (item >> 8) & 0xff
        arr[j + 3] = item & 0xff
    }

    if (fast) {
        return Buffer.from(arr).toString('hex')
    }

    return arr.map(function(i) { return i.toString(16).padStart(2, '0') }).join('')
}