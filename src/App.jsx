import React, { useState, useEffect } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

import './App.css'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export default function WorldGuessMap() {
  const [selected, setSelected] = useState(null)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState({})
  const [mistakes, setMistakes] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(data => {
        const features = data.objects.ne_110m_admin_0_countries.geometries
        setTotal(features.length)
      })
  }, [])

  const handleCountryClick = geo => {
    setSelected(geo)
    setInput('')
  }

  const handleSubmit = () => {
    if (!selected) return
    const name = selected.properties.name
    const realName = name.toLowerCase().trim()
    const guess = input.toLowerCase().trim()

    if (guess === realName) {
      if (status[name] !== 'correct') {
        setStatus(prev => ({ ...prev, [name]: 'correct' }))
        setCorrectCount(prev => prev + 1)
      }
    } else {
      setStatus(prev => ({ ...prev, [name]: 'wrong' }))
      setMistakes(prev => prev + 1)
      setTimeout(() => {
        setStatus(prev => ({ ...prev, [name]: undefined }))
      }, 1000)
    }
    setSelected(null)
    setInput('')
  }

  const getColor = name => {
    if (name === selected?.properties.name) return '#1f8fa0ff'
    if (status[name] === 'correct') return '#4caf50'
    if (status[name] === 'wrong') return '#f44336'
    return '#ccc'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <ComposableMap>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => handleCountryClick(geo)}
                style={{
                  default: { fill: getColor(geo.properties.name), outline: 'none' },
                  hover: { fill: '#999', outline: 'none' },
                  pressed: { fill: '#aaa', outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>

      {selected && (
        <div className="mt-4">
          <label>
            Guess the country name:
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="border px-2 py-1 ml-2"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </label>
          <button onClick={handleSubmit} className="ml-2 px-3 py-1 bg-blue-500 text-white">
            Submit
          </button>
        </div>
      )}

      <div className="mt-4 text-lg">
        <p>Mistakes: {mistakes}</p>
        <p>Correct: {correctCount} / {total}</p>
      </div>
    </div>
  )
}
