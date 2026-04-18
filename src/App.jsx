import { useState } from 'react'
import Scanner from './Scanner'
import './App.css'

const MOCK_PRODUCTS = {
  '012345678905': { name: 'Coca-Cola 500ml', price: 1.99, stock: 48 },
  '8901030890396': { name: "Lay's Classic Chips", price: 2.49, stock: 30 },
  '4006381333931': { name: 'Stabilo Boss Highlighter', price: 3.99, stock: 12 },
  '5000112546415': { name: 'Cadbury Dairy Milk', price: 1.75, stock: 25 },
  '0194252912355': { name: 'Apple USB-C Cable', price: 19.99, stock: 7 },
}

export default function App() {
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(null)
  const [cart, setCart] = useState([])
  const [flash, setFlash] = useState(null)

  function handleScan(barcode) {
    setScanning(false)
    const product = MOCK_PRODUCTS[barcode]
    if (product) {
      setScanned({ barcode, ...product, found: true })
      showFlash('success', 'Found: ' + product.name)
    } else {
      setScanned({ barcode, found: false })
      showFlash('error', 'No product for: ' + barcode)
    }
  }

  function showFlash(type, msg) {
    setFlash({ type, msg })
    setTimeout(() => setFlash(null), 3000)
  }

  function addToCart() {
    if (!scanned?.found) return
    setCart(prev => {
      const existing = prev.find(i => i.barcode === scanned.barcode)
      if (existing) return prev.map(i => i.barcode === scanned.barcode ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...scanned, qty: 1 }]
    })
    showFlash('success', 'Added ' + scanned.name)
    setScanned(null)
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <div className="app">
      <header>
        <div className="logo">⬡ ScanSell</div>
        <div className="cart-badge">🛒 {cart.reduce((s, i) => s + i.qty, 0)}</div>
      </header>

      {flash && <div className={'flash flash--' + flash.type}>{flash.msg}</div>}

      <main>
        {!scanning ? (
          <>
            <section className="hero">
              <div className="scan-icon">⬡</div>
              <h1>Product Scanner</h1>
              <p>Point your camera at any barcode or QR code</p>
              <button className="btn-scan" onClick={() => { setScanned(null); setScanning(true) }}>
                Start Scanning
              </button>
            </section>

            {scanned && (
              <section className="result-card">
                <div className="result-header">
                  <span className="barcode-label">#{scanned.barcode}</span>
                  <span className={'badge ' + (scanned.found ? 'badge--found' : 'badge--not-found')}>
                    {scanned.found ? 'IN STOCK' : 'NOT FOUND'}
                  </span>
                </div>
                {scanned.found ? (
                  <>
                    <h2>{scanned.name}</h2>
                    <div className="product-meta">
                      <span className="price">${scanned.price.toFixed(2)}</span>
                      <span className="stock">{scanned.stock} units</span>
                    </div>
                    <button className="btn-add" onClick={addToCart}>Add to Sale</button>
                  </>
                ) : (
                  <p className="not-found-msg">No product matched. Try another scan.</p>
                )}
              </section>
            )}

            {cart.length > 0 && (
              <section className="cart">
                <h3>Current Sale</h3>
                <ul>
                  {cart.map(item => (
                    <li key={item.barcode}>
                      <span className="item-name">{item.name}</span>
                      <span className="item-detail">x{item.qty} · ${(item.price * item.qty).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="cart-total">
                  <span>Total</span>
                  <span className="total-amount">${total.toFixed(2)}</span>
                </div>
                <button className="btn-checkout" onClick={() => { setCart([]); showFlash('success', 'Sale completed!') }}>
                  Complete Sale
                </button>
              </section>
            )}

            <section className="demo-hint">
              <h4>Simulate a Scan (Demo)</h4>
              <div className="demo-codes">
                {Object.entries(MOCK_PRODUCTS).map(([code, p]) => (
                  <button key={code} className="demo-code" onClick={() => handleScan(code)}>
                    <span className="demo-name">{p.name}</span>
                    <span className="demo-barcode">{code}</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          <Scanner onScan={handleScan} onClose={() => setScanning(false)} />
        )}
      </main>
    </div>
  )
}
