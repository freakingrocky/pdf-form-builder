import { describe, it, expect } from 'vitest'
import QRCode from 'qrcode'

import { QrFormBuilder } from './index'

// basic test for qrcode generation

describe('qr generator', () => {
  it('creates data url', async () => {
    const data = { a: 1 }
    const url = await QRCode.toDataURL(JSON.stringify(data))
    expect(url.startsWith('data:image/png')).toBe(true)
  })
})
