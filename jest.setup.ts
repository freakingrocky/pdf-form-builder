import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// polyfill for qrcode library
Object.assign(global, { TextEncoder, TextDecoder })
