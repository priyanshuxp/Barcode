import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'

export default function Scanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    reader.listVideoInputDevices().then(devices => {
      setCameras(devices)
      // Prefer back camera on mobile
      const back = devices.find(d => /back|rear|environment/i.test(d.label))
      const chosen = back || devices[0]
      if (chosen) setSelectedCamera(chosen.deviceId)
    }).catch(err => {
      setError('Camera access denied. Please allow camera permission.')
    })

    return () => {
      reader.reset()
    }
  }, [])

  useEffect(() => {
    if (!selectedCamera || !videoRef.current) return
    const reader = readerRef.current
    setScanning(true)
    setError(null)

    reader.decodeFromVideoDevice(selectedCamera, videoRef.current, (result, err) => {
      if (result) {
        const text = result.getText()
        if (text !== lastResult) {
          setLastResult(text)
          // Small vibration feedback on mobile
          if (navigator.vibrate) navigator.vibrate(100)
          onScan(text)
        }
      }
      if (err && !(err instanceof NotFoundException)) {
        console.warn(err)
      }
    }).catch(err => {
      setError('Could not start camera: ' + err.message)
      setScanning(false)
    })

    return () => {
      reader.reset()
      setScanning(false)
    }
  }, [selectedCamera])

  return (
    <div className="scanner-view">
      <div className="scanner-topbar">
        <button className="btn-close" onClick={onClose}>✕ Cancel</button>
        {cameras.length > 1 && (
          <select
            className="camera-select"
            value={selectedCamera || ''}
            onChange={e => setSelectedCamera(e.target.value)}
          >
            {cameras.map(c => (
              <option key={c.deviceId} value={c.deviceId}>
                {c.label || 'Camera ' + c.deviceId.slice(0, 6)}
              </option>
            ))}
          </select>
        )}
      </div>

      {error ? (
        <div className="scanner-error">
          <div className="error-icon">⚠</div>
          <p>{error}</p>
          <button className="btn-scan" onClick={onClose}>Go Back</button>
        </div>
      ) : (
        <div className="video-wrapper">
          <video ref={videoRef} className="scanner-video" autoPlay playsInline muted />
          <div className="scan-overlay">
            <div className="scan-corner tl" />
            <div className="scan-corner tr" />
            <div className="scan-corner bl" />
            <div className="scan-corner br" />
            <div className="scan-line" />
          </div>
          <p className="scan-hint">{scanning ? 'Align barcode within the frame' : 'Starting camera...'}</p>
        </div>
      )}
    </div>
  )
}
