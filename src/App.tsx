import React, { useState, useEffect, useRef } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface SavedColor {
  color: string;
  tag: string;
}

interface Palette {
  id: string;
  name: string;
  colors: SavedColor[];
}

interface DragItem {
  type: string
  id: string
  paletteId: string
  index: number
  color: SavedColor
}

interface Point {
  x: number;
  y: number;
}

function DropZone({ 
  paletteId, 
  isDarkMode,
  moveColor 
}: { 
  paletteId: string
  isDarkMode: boolean
  moveColor: (dragPaletteId: string, dragIndex: number, dropPaletteId: string, dropIndex: number) => void
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COLOR',
    drop: (item: DragItem) => {
      moveColor(item.paletteId, item.index, paletteId, 0)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div 
      ref={drop}
      className={`relative col-span-full h-24 rounded-lg border-2 border-dashed flex items-center justify-center ${
        isDarkMode 
          ? 'border-zinc-700 text-zinc-500' 
          : 'border-gray-200 text-gray-400'
      }`}
    >
      {isOver && (
        <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 rounded-full" />
      )}
      Drop colors here
    </div>
  )
}

function DropZoneBetween({ 
  paletteId, 
  index,
  moveColor,
  isDarkMode 
}: { 
  paletteId: string
  index: number
  moveColor: (dragPaletteId: string, dragIndex: number, dropPaletteId: string, dropIndex: number) => void
  isDarkMode: boolean
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COLOR',
    drop: (item: DragItem) => {
      moveColor(item.paletteId, item.index, paletteId, index)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div 
      ref={drop}
      className="absolute -left-2 inset-y-0 w-4 cursor-move"
    >
      {isOver && (
        <div className="absolute left-1/2 inset-y-0 w-1 bg-blue-500 rounded-full transform -translate-x-1/2" />
      )}
    </div>
  )
}

function ColorCard({ 
  color: savedColor, 
  index, 
  paletteId, 
  moveColor,
  isDarkMode,
  setColor,
  copyToClipboard,
  deleteColor,
  editingIndex,
  editingPaletteId,
  editingTag,
  setEditingTag,
  handleTagKeyPress,
  updateTag,
  startEditing,
  palettes,
  addColorToPalette
}: { 
  color: SavedColor
  index: number
  paletteId: string
  moveColor: (dragPaletteId: string, dragIndex: number, dropPaletteId: string, dropIndex: number) => void
  isDarkMode: boolean
  setColor: (color: string) => void
  copyToClipboard: (text: string) => void
  deleteColor: (paletteId: string, index: number) => void
  editingIndex: number | null
  editingPaletteId: string | null
  editingTag: string
  setEditingTag: (tag: string) => void
  handleTagKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, paletteId: string, index: number) => void
  updateTag: (paletteId: string, index: number) => void
  startEditing: (paletteId: string, index: number, tag: string) => void
  palettes: Palette[]
  addColorToPalette: (targetPaletteId: string, color: SavedColor) => void
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COLOR',
    item: { type: 'COLOR', id: `${paletteId}-${index}`, paletteId, index, color: savedColor },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div 
      ref={editingIndex === index && editingPaletteId === paletteId ? null : drag}
      className={`flex flex-col gap-2 p-3 rounded-lg border transition-transform ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${
        isDarkMode 
          ? 'bg-zinc-800 border-zinc-700' 
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div
        className="w-full h-24 rounded-md shadow-md cursor-pointer hover:scale-105 transition-transform"
        style={{ backgroundColor: savedColor.color }}
        onClick={() => setColor(savedColor.color)}
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard(savedColor.color)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-colors ${
              isDarkMode 
                ? 'bg-zinc-700 text-gray-200 hover:bg-zinc-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {savedColor.color}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M17.663 3.118c.225.015.45.032.673.05C19.876 3.298 21 4.604 21 6.109v9.642a3 3 0 01-3 3V16.5c0-5.922-4.576-10.775-10.384-11.217.324-1.132 1.3-2.01 2.548-2.114.224-.019.448-.036.673-.051A3 3 0 0113.5 1.5H15a3 3 0 012.663 1.618zM12 4.5A1.5 1.5 0 0113.5 3H15a1.5 1.5 0 011.5 1.5H12z" />
              <path d="M3 8.625c0-1.036.84-1.875 1.875-1.875h.375A3.75 3.75 0 019 10.5v1.875c0 1.036.84 1.875 1.875 1.875h1.875A3.75 3.75 0 0116.5 18v2.625c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625v-12z" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => deleteColor(paletteId, index)}
          className={`p-1 transition-colors ${
            isDarkMode 
              ? 'text-red-400 hover:text-red-300' 
              : 'text-red-500 hover:text-red-600'
          }`}
          title="Delete color"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" />
          </svg>
        </button>
      </div>
      {editingIndex === index && editingPaletteId === paletteId ? (
        <input
          type="text"
          value={editingTag}
          onChange={(e) => setEditingTag(e.target.value)}
          onKeyDown={(e) => handleTagKeyPress(e, paletteId, index)}
          onBlur={() => {
            if (editingTag.trim()) {
              updateTag(paletteId, index)
            }
          }}
          className={`w-full px-2 py-1 text-xs rounded border ${
            isDarkMode 
              ? 'bg-zinc-700 text-gray-100 border-zinc-600' 
              : 'bg-gray-50 text-gray-700 border-gray-200'
          }`}
          autoFocus
        />
      ) : (
        <div 
          className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors border ${
            isDarkMode 
              ? 'bg-zinc-700 text-gray-200 border-zinc-600 hover:bg-zinc-600' 
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
          }`}
          onClick={() => startEditing(paletteId, index, savedColor.tag)}
        >
          <span className="block truncate">{savedColor.tag}</span>
        </div>
      )}
    </div>
  )
}

function App() {
  const [color, setColor] = useState(() => {
    const savedColor = localStorage.getItem('currentColor')
    return savedColor || '#FF5733'
  })
  const [palettes, setPalettes] = useState<Palette[]>(() => {
    const saved = localStorage.getItem('palettes')
    return saved ? JSON.parse(saved) : []
  })
  const [activePaletteId, setActivePaletteId] = useState<string>(() => {
    const saved = localStorage.getItem('activePaletteId')
    if (saved && palettes.some(p => p.id === saved)) {
      return saved
    }
    return palettes[0]?.id || ''
  })
  const [editingPaletteName, setEditingPaletteName] = useState<string | null>(null)
  const [newPaletteName, setNewPaletteName] = useState('')
  const [rgbColor, setRgbColor] = useState('')
  const [hslColor, setHslColor] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingTag, setEditingTag] = useState('')
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const theme = localStorage.getItem('theme')
    return theme ? theme === 'dark' : true
  })
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isPickingColor, setIsPickingColor] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [magnifierPosition, setMagnifierPosition] = useState<{ x: number; y: number } | null>(null)
  const [magnifierColor, setMagnifierColor] = useState<string>('#ffffff')
  const [zoomedCanvas, setZoomedCanvas] = useState<HTMLCanvasElement | null>(null);

  // Save palettes to localStorage when they change
  useEffect(() => {
    localStorage.setItem('palettes', JSON.stringify(palettes))
  }, [palettes])

  // Save active palette ID to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('activePaletteId', activePaletteId)
  }, [activePaletteId])

  const createNewPalette = () => {
    const newPalette: Palette = {
      id: Date.now().toString(),
      name: `Palette ${palettes.length + 1}`,
      colors: []
    }
    setPalettes([...palettes, newPalette])
    setActivePaletteId(newPalette.id)
  }

  const deletePalette = (id: string) => {
    setPalettes(palettes.filter(p => p.id !== id))
    if (activePaletteId === id) {
      setActivePaletteId(palettes[0]?.id || '')
    }
  }

  const renamePalette = (id: string, newName: string) => {
    if (newName.trim()) {
      setPalettes(prevPalettes => prevPalettes.map(p => 
        p.id === id ? { ...p, name: newName.trim() } : p
      ))
      setEditingPaletteName(null)
      setNewPaletteName('')
    }
  }

  const saveColor = () => {
    // If no palettes exist, create Palette 1
    if (palettes.length === 0) {
      const newPalette: Palette = {
        id: Date.now().toString(),
        name: 'Palette 1',
        colors: [{ color, tag: 'Color 1' }]
      }
      setPalettes([newPalette])
      setActivePaletteId(newPalette.id)
      return
    }

    // Save to selected palette
    setPalettes(palettes.map(palette => {
      if (palette.id === activePaletteId && !palette.colors.some(c => c.color === color)) {
        return {
          ...palette,
          colors: [...palette.colors, { color, tag: `Color ${palette.colors.length + 1}` }]
        }
      }
      return palette
    }))
  }

  const deleteColor = (paletteId: string, index: number) => {
    setPalettes(palettes.map(palette => 
      palette.id === paletteId
        ? { ...palette, colors: palette.colors.filter((_, i) => i !== index) }
        : palette
    ))
  }

  const updateTag = (paletteId: string, index: number) => {
    if (editingTag.trim()) {
      setPalettes(prevPalettes => prevPalettes.map(palette => {
        if (palette.id === paletteId) {
          const updatedColors = [...palette.colors]
          updatedColors[index] = { ...updatedColors[index], tag: editingTag.trim() }
          return { ...palette, colors: updatedColors }
        }
        return palette
      }))
      setEditingPaletteId(null)
      setEditingIndex(null)
      setEditingTag('')
    }
  }

  const handlePaletteKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      if (newPaletteName.trim()) {
        renamePalette(id, newPaletteName)
      }
    } else if (e.key === 'Escape') {
      setEditingPaletteName(null)
      setNewPaletteName('')
    }
  }

  const startEditing = (paletteId: string, index: number, tag: string) => {
    setEditingPaletteId(paletteId)
    setEditingIndex(index)
    setEditingTag(tag)
  }

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, paletteId: string, index: number) => {
    if (e.key === 'Enter') {
      if (editingTag.trim()) {
        updateTag(paletteId, index)
      }
    } else if (e.key === 'Escape') {
      setEditingPaletteId(null)
      setEditingIndex(null)
      setEditingTag('')
    }
  }

  const activePalette = palettes.find(p => p.id === activePaletteId)

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  // Save current color to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('currentColor', color)
  }, [color])

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)
      return `rgb(${r}, ${g}, ${b})`
    }
    return ''
  }

  // Convert hex to HSL
  const hexToHsl = (hex: string) => {
    // Convert hex to RGB first
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      let r = parseInt(result[1], 16) / 255
      let g = parseInt(result[2], 16) / 255
      let b = parseInt(result[3], 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0, s, l = (max + min) / 2

      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }

      return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
    }
    return ''
  }

  useEffect(() => {
    setRgbColor(hexToRgb(color))
    setHslColor(hexToHsl(color))
  }, [color])

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Create and show notification
    const notification = document.createElement('div')
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white bg-green-500 shadow-lg transition-all duration-300 flex items-center gap-2`
    
    // Add check icon
    notification.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
        <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd" />
      </svg>
      <span>Kopyalandı!</span>
    `
    
    document.body.appendChild(notification)
    
    // Add initial transform
    notification.style.transform = 'translateY(100px)'
    notification.style.opacity = '0'
    
    // Trigger animation
    setTimeout(() => {
      notification.style.transform = 'translateY(0)'
      notification.style.opacity = '1'
    }, 0)
    
    // Remove notification after 2 seconds
    setTimeout(() => {
      notification.style.transform = 'translateY(100px)'
      notification.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 2000)
  }

  // Add export functions
  const saveFileWithPicker = async (content: string | Blob, suggestedName: string, type: string) => {
    try {
      // @ts-ignore - showSaveFilePicker is not yet in the TypeScript types
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{
          description: 'File',
          accept: {
            [type]: [`.${suggestedName.split('.').pop()}`]
          }
        }],
      });
      
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to save file:', err);
        // Fallback to direct download if the File System API is not supported
        const url = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type }));
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
  };

  const exportAsJson = async () => {
    const data = JSON.stringify(palettes, null, 2);
    await saveFileWithPicker(data, 'color-palette.json', 'application/json');
  };

  const exportAsCss = async () => {
    const cssContent = palettes.map(palette => 
      palette.colors.map(color => 
        `--${color.tag.toLowerCase().replace(/\s+/g, '-')}: ${color.color};`
      ).join('\n')
    ).join('\n\n');
    const content = `:root {\n${cssContent}\n}`;
    
    await saveFileWithPicker(content, 'color-palette.css', 'text/css');
  };

  const exportAsScss = async () => {
    const scssContent = palettes.map(palette => 
      palette.colors.map(color => 
        `$${color.tag.toLowerCase().replace(/\s+/g, '-')}: ${color.color};`
      ).join('\n')
    ).join('\n\n');
    
    await saveFileWithPicker(scssContent, 'color-palette.scss', 'text/x-scss');
  };

  const exportAsTxt = async () => {
    const txtContent = palettes.map(palette => 
      `${palette.name}:\n\n` +
      palette.colors.map(color => 
        `${color.tag}:\nHEX: ${color.color}\nRGB: ${hexToRgb(color.color)}\nHSL: ${hexToHsl(color.color)}\n`
      ).join('\n')
    ).join('\n\n' + '='.repeat(40) + '\n\n');
    
    await saveFileWithPicker(txtContent, 'all-palettes.txt', 'text/plain');
  };

  const exportAsPng = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scale = 3 // Scale factor for higher resolution
    const padding = 20 * scale
    const swatchSize = 80 * scale
    const swatchesPerRow = 5
    const titleHeight = 30 * scale
    const textPadding = 80 * scale
    const maxLineWidth = (swatchSize - (10 * scale)) // Maximum width for text lines
    const borderRadius = 12 * scale // Radius for rounded corners
    
    // Helper function to draw rounded rectangle
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
    }
    
    // Helper function to wrap text
    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(' ')
      const lines: string[] = []
      let currentLine = words[0]

      for (let i = 1; i < words.length; i++) {
        const word = words[i]
        const width = ctx.measureText(`${currentLine} ${word}`).width
        if (width < maxWidth) {
          currentLine += " " + word
        } else {
          lines.push(currentLine)
          currentLine = word
        }
      }
      lines.push(currentLine)
      return lines
    }
    
    // Calculate total height needed
    let totalHeight = padding
    palettes.forEach(palette => {
      totalHeight += titleHeight // Palette name height
      const rows = Math.ceil(palette.colors.length / swatchesPerRow)
      totalHeight += (swatchSize + padding + textPadding) * rows // Colors height with increased text padding
      totalHeight += padding * 2 // Extra padding between palettes
    })

    const maxWidth = padding * 2 + (swatchSize + padding) * swatchesPerRow
    canvas.width = maxWidth
    canvas.height = totalHeight

    // Enable high-quality image rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Fill background
    ctx.fillStyle = isDarkMode ? '#18181B' : '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let currentY = padding

    palettes.forEach((palette) => {
      // Draw palette name
      ctx.fillStyle = isDarkMode ? '#E5E7EB' : '#111827'
      ctx.font = `bold ${16 * scale}px system-ui`
      ctx.textAlign = 'left'
      ctx.fillText(palette.name, padding, currentY + (16 * scale))
      
      currentY += titleHeight

      // Draw colors for this palette
      palette.colors.forEach((color, index) => {
        const row = Math.floor(index / swatchesPerRow)
        const col = index % swatchesPerRow
        const x = padding + (swatchSize + padding) * col
        const y = currentY + (swatchSize + padding + textPadding) * row

        // Draw color swatch with rounded corners
        ctx.fillStyle = color.color
        drawRoundedRect(x, y, swatchSize, swatchSize, borderRadius)
        ctx.fill()
        
        // Draw border with rounded corners
        ctx.strokeStyle = isDarkMode ? '#27272A' : '#E5E7EB'
        ctx.lineWidth = 2 * scale
        drawRoundedRect(x, y, swatchSize, swatchSize, borderRadius)
        ctx.stroke()

        // Draw color code and tag
        ctx.fillStyle = isDarkMode ? '#E5E7EB' : '#111827'
        
        // Draw hex code
        ctx.font = `${11 * scale}px monospace`
        ctx.textAlign = 'center'
        ctx.fillText(color.color, x + swatchSize/2, y + swatchSize + (20 * scale))
        
        // Draw multi-line tag
        ctx.font = `${10 * scale}px system-ui`
        const lines = wrapText(color.tag, maxLineWidth)
        lines.forEach((line, lineIndex) => {
          ctx.fillText(line, x + swatchSize/2, y + swatchSize + (35 * scale) + (lineIndex * (12 * scale)))
        })
      })

      // Update Y position for next palette
      const rows = Math.ceil(palette.colors.length / swatchesPerRow)
      currentY += (swatchSize + padding + textPadding) * rows + padding * 2
    })

    const blob = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png', 1.0));
    await saveFileWithPicker(blob, 'all-palettes.png', 'image/png');
  }

  const moveColor = (dragPaletteId: string, dragIndex: number, dropPaletteId: string, dropIndex: number) => {
    setPalettes(prevPalettes => {
      const newPalettes = [...prevPalettes]
      const dragPalette = newPalettes.find(p => p.id === dragPaletteId)
      const dropPalette = newPalettes.find(p => p.id === dropPaletteId)
      
      if (!dragPalette || !dropPalette) return prevPalettes

      const [draggedColor] = dragPalette.colors.splice(dragIndex, 1)
      
      if (dragPaletteId === dropPaletteId) {
        // Moving within the same palette
        dragPalette.colors.splice(dropIndex, 0, draggedColor)
      } else {
        // Moving between different palettes
        dropPalette.colors.splice(dropIndex, 0, { ...draggedColor, tag: `Color ${dropPalette.colors.length + 1}` })
      }

      return newPalettes
    })
  }

  const addColorToPalette = (targetPaletteId: string, color: SavedColor) => {
    setPalettes(prevPalettes => {
      return prevPalettes.map(palette => {
        if (palette.id === targetPaletteId && !palette.colors.some(c => c.color === color.color)) {
          return {
            ...palette,
            colors: [...palette.colors, { ...color, tag: `Color ${palette.colors.length + 1}` }]
          }
        }
        return palette
      })
    })
  }

  useEffect(() => {
    if (uploadedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          // Set the canvas's internal dimensions to match the image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Clear the canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw the image at its original size
          ctx.drawImage(img, 0, 0);
          
          // Set the display size
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          canvas.style.maxWidth = '800px';
          
          setIsPickingColor(true);
        };
        
        img.src = uploadedImage;
      }
    }
  }, [uploadedImage]);

  const getPixelColor = (ctx: CanvasRenderingContext2D, x: number, y: number): string => {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = '#' + 
      pixel[0].toString(16).padStart(2, '0') + 
      pixel[1].toString(16).padStart(2, '0') + 
      pixel[2].toString(16).padStart(2, '0');
    return hex.toUpperCase();
  };

  const getCanvasCoordinates = (canvas: HTMLCanvasElement, clientX: number, clientY: number): { x: number, y: number } => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((clientX - rect.left) / rect.width * canvas.width);
    const y = Math.round((clientY - rect.top) / rect.height * canvas.height);
    return { x, y };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (ctx) {
      const { x, y } = getCanvasCoordinates(canvas, e.clientX, e.clientY);
      const color = getPixelColor(ctx, x, y);
      setColor(color);
    }
  };

  const createZoomedCanvas = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const zoomCanvas = document.createElement('canvas');
    const zoomCtx = zoomCanvas.getContext('2d');
    if (!zoomCtx) return null;

    const zoomLevel = 12; // Reduced from 20
    const zoomSize = 7; // Reduced from 11
    zoomCanvas.width = zoomSize * zoomLevel;
    zoomCanvas.height = zoomSize * zoomLevel;

    // Fill with dark/light background
    zoomCtx.fillStyle = isDarkMode ? '#18181b' : '#fafafa';
    zoomCtx.fillRect(0, 0, zoomCanvas.width, zoomCanvas.height);

    // Draw zoomed pixels
    for (let offsetY = -Math.floor(zoomSize/2); offsetY <= Math.floor(zoomSize/2); offsetY++) {
      for (let offsetX = -Math.floor(zoomSize/2); offsetX <= Math.floor(zoomSize/2); offsetX++) {
        const pixelX = Math.max(0, Math.min(x + offsetX, ctx.canvas.width - 1));
        const pixelY = Math.max(0, Math.min(y + offsetY, ctx.canvas.height - 1));
        
        const pixel = ctx.getImageData(pixelX, pixelY, 1, 1).data;
        zoomCtx.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        zoomCtx.fillRect(
          (offsetX + Math.floor(zoomSize/2)) * zoomLevel,
          (offsetY + Math.floor(zoomSize/2)) * zoomLevel,
          zoomLevel,
          zoomLevel
        );
      }
    }

    // Draw subtle grid
    zoomCtx.strokeStyle = isDarkMode ? 'rgba(24, 24, 27, 0.3)' : 'rgba(250, 250, 250, 0.3)';
    zoomCtx.lineWidth = 0.5;
    for (let i = 0; i <= zoomSize; i++) {
      const pos = i * zoomLevel;
      zoomCtx.beginPath();
      zoomCtx.moveTo(pos, 0);
      zoomCtx.lineTo(pos, zoomCanvas.height);
      zoomCtx.stroke();
      zoomCtx.beginPath();
      zoomCtx.moveTo(0, pos);
      zoomCtx.lineTo(zoomCanvas.width, pos);
      zoomCtx.stroke();
    }

    // Highlight center pixel with a subtle border
    zoomCtx.strokeStyle = isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.7)';
    zoomCtx.lineWidth = 1;
    zoomCtx.strokeRect(
      Math.floor(zoomSize/2) * zoomLevel + 0.5,
      Math.floor(zoomSize/2) * zoomLevel + 0.5,
      zoomLevel - 1,
      zoomLevel - 1
    );

    return zoomCanvas;
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (ctx) {
      const { x, y } = getCanvasCoordinates(canvas, e.clientX, e.clientY);
      const color = getPixelColor(ctx, x, y);
      setMagnifierColor(color);
      setMagnifierPosition({ x: e.clientX, y: e.clientY });
      
      // Create zoomed canvas
      const zoomedCanvas = createZoomedCanvas(ctx, x, y);
      setZoomedCanvas(zoomedCanvas);
    }
  };

  const handleCanvasMouseLeave = () => {
    setMagnifierPosition(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setUploadedImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setUploadedImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result;
              if (typeof result === 'string') {
                setUploadedImage(result);
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const exportSinglePaletteAsPng = async (targetPalette: Palette) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scale = 3 // Scale factor for higher resolution
    const padding = 20 * scale
    const swatchSize = 80 * scale
    const swatchesPerRow = 5
    const titleHeight = 30 * scale
    const textPadding = 80 * scale
    const maxLineWidth = (swatchSize - (10 * scale)) // Maximum width for text lines
    const borderRadius = 12 * scale // Radius for rounded corners
    
    // Helper function to draw rounded rectangle
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
    }
    
    // Helper function to wrap text
    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(' ')
      const lines: string[] = []
      let currentLine = words[0]

      for (let i = 1; i < words.length; i++) {
        const word = words[i]
        const width = ctx.measureText(`${currentLine} ${word}`).width
        if (width < maxWidth) {
          currentLine += " " + word
        } else {
          lines.push(currentLine)
          currentLine = word
        }
      }
      lines.push(currentLine)
      return lines
    }
    
    // Calculate height needed for single palette
    const rows = Math.ceil(targetPalette.colors.length / swatchesPerRow)
    const totalHeight = padding + titleHeight + (swatchSize + padding + textPadding) * rows + padding

    const maxWidth = padding * 2 + (swatchSize + padding) * swatchesPerRow
    canvas.width = maxWidth
    canvas.height = totalHeight

    // Enable high-quality image rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Fill background
    ctx.fillStyle = isDarkMode ? '#18181B' : '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let currentY = padding

    // Draw palette name
    ctx.fillStyle = isDarkMode ? '#E5E7EB' : '#111827'
    ctx.font = `bold ${16 * scale}px system-ui`
    ctx.textAlign = 'left'
    ctx.fillText(targetPalette.name, padding, currentY + (16 * scale))
    
    currentY += titleHeight

    // Draw colors for this palette
    targetPalette.colors.forEach((color, index) => {
      const row = Math.floor(index / swatchesPerRow)
      const col = index % swatchesPerRow
      const x = padding + (swatchSize + padding) * col
      const y = currentY + (swatchSize + padding + textPadding) * row

      // Draw color swatch with rounded corners
      ctx.fillStyle = color.color
      drawRoundedRect(x, y, swatchSize, swatchSize, borderRadius)
      ctx.fill()
      
      // Draw border with rounded corners
      ctx.strokeStyle = isDarkMode ? '#27272A' : '#E5E7EB'
      ctx.lineWidth = 2 * scale
      drawRoundedRect(x, y, swatchSize, swatchSize, borderRadius)
      ctx.stroke()

      // Draw color code and tag
      ctx.fillStyle = isDarkMode ? '#E5E7EB' : '#111827'
      
      // Draw hex code
      ctx.font = `${11 * scale}px monospace`
      ctx.textAlign = 'center'
      ctx.fillText(color.color, x + swatchSize/2, y + swatchSize + (20 * scale))
      
      // Draw multi-line tag
      ctx.font = `${10 * scale}px system-ui`
      const lines = wrapText(color.tag, maxLineWidth)
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, x + swatchSize/2, y + swatchSize + (35 * scale) + (lineIndex * (12 * scale)))
      })
    })

    const blob = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png', 1.0));
    const filename = `${targetPalette.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    await saveFileWithPicker(blob, filename, 'image/png');
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen w-full ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center">
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🎨️ Online Color Picker 🖌️
              </h1>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-gray-800 hover:bg-gray-100'} transition-colors border ${isDarkMode ? 'border-zinc-700' : 'border-gray-200'}`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className={`rounded-lg shadow-xl p-6 mb-6 border ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex flex-col items-center gap-6">
                <div 
                  className="w-40 h-40 rounded-lg shadow-md"
                  style={{ backgroundColor: color }}
                />
                
                <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-[142px] rounded-lg overflow-hidden shadow-md group cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                      <input
                        type="color"
                        value={color}
                        onChange={handleColorChange}
                        className="absolute inset-0 w-full h-full cursor-pointer z-20"
                        style={{ opacity: 0 }}
                      />
                      <div 
                        className="absolute inset-0 w-full h-full pointer-events-none z-10"
                        style={{ backgroundColor: color }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                          <path fillRule="evenodd" d="M20.599 1.5c-.376 0-.743.111-1.055.32l-5.08 3.385a18.747 18.747 0 00-3.471 2.987 10.04 10.04 0 014.815 4.815 18.748 18.748 0 002.987-3.472l3.386-5.079A1.902 1.902 0 0020.599 1.5zm-8.3 14.025a18.76 18.76 0 001.896-1.207 8.026 8.026 0 00-4.513-4.513A18.75 18.75 0 008.475 11.7l-.278.5a5.26 5.26 0 013.601 3.602l.502-.278zM6.75 13.5A3.75 3.75 0 003 17.25a1.5 1.5 0 01-1.601 1.497.75.75 0 00-.7 1.123 5.25 5.25 0 009.8-2.62 3.75 3.75 0 00-3.75-3.75z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 gap-2">
                      <div className={`flex items-center justify-between px-4 py-2 rounded-md border ${
                        isDarkMode 
                          ? 'bg-zinc-800 border-zinc-700 text-gray-200' 
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}>
                        <span className="font-medium">HEX:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{color.toUpperCase()}</span>
                          <button
                            onClick={() => copyToClipboard(color.toUpperCase())}
                            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                            title="Copy HEX"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M17.663 3.118c.225.015.45.032.673.05C19.876 3.298 21 4.604 21 6.109v9.642a3 3 0 01-3 3V16.5c0-5.922-4.576-10.775-10.384-11.217.324-1.132 1.3-2.01 2.548-2.114.224-.019.448-.036.673-.051A3 3 0 0113.5 1.5H15a3 3 0 012.663 1.618zM12 4.5A1.5 1.5 0 0113.5 3H15a1.5 1.5 0 011.5 1.5H12z" />
                              <path d="M3 8.625c0-1.036.84-1.875 1.875-1.875h.375A3.75 3.75 0 019 10.5v1.875c0 1.036.84 1.875 1.875 1.875h1.875A3.75 3.75 0 0116.5 18v2.625c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625v-12z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className={`flex items-center justify-between px-4 py-2 rounded-md border ${
                        isDarkMode 
                          ? 'bg-zinc-800 border-zinc-700 text-gray-200' 
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}>
                        <span className="font-medium">RGB:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{rgbColor}</span>
                          <button
                            onClick={() => copyToClipboard(rgbColor)}
                            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                            title="Copy RGB"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M17.663 3.118c.225.015.45.032.673.05C19.876 3.298 21 4.604 21 6.109v9.642a3 3 0 01-3 3V16.5c0-5.922-4.576-10.775-10.384-11.217.324-1.132 1.3-2.01 2.548-2.114.224-.019.448-.036.673-.051A3 3 0 0113.5 1.5H15a3 3 0 012.663 1.618zM12 4.5A1.5 1.5 0 0113.5 3H15a1.5 1.5 0 011.5 1.5H12z" />
                              <path d="M3 8.625c0-1.036.84-1.875 1.875-1.875h.375A3.75 3.75 0 019 10.5v1.875c0 1.036.84 1.875 1.875 1.875h1.875A3.75 3.75 0 0116.5 18v2.625c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625v-12z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className={`flex items-center justify-between px-4 py-2 rounded-md border ${
                        isDarkMode 
                          ? 'bg-zinc-800 border-zinc-700 text-gray-200' 
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}>
                        <span className="font-medium">HSL:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{hslColor}</span>
                          <button
                            onClick={() => copyToClipboard(hslColor)}
                            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                            title="Copy HSL"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M17.663 3.118c.225.015.45.032.673.05C19.876 3.298 21 4.604 21 6.109v9.642a3 3 0 01-3 3V16.5c0-5.922-4.576-10.775-10.384-11.217.324-1.132 1.3-2.01 2.548-2.114.224-.019.448-.036.673-.051A3 3 0 0113.5 1.5H15a3 3 0 012.663 1.618zM12 4.5A1.5 1.5 0 0113.5 3H15a1.5 1.5 0 011.5 1.5H12z" />
                              <path d="M3 8.625c0-1.036.84-1.875 1.875-1.875h.375A3.75 3.75 0 019 10.5v1.875c0 1.036.84 1.875 1.875 1.875h1.875A3.75 3.75 0 0116.5 18v2.625c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625v-12z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {palettes.length > 0 && (
                      <div className="flex-1">
                        <select
                          value={activePaletteId}
                          onChange={(e) => setActivePaletteId(e.target.value)}
                          className={`w-full px-4 py-2 rounded-md border transition-colors ${
                            isDarkMode 
                              ? 'bg-zinc-800 border-zinc-700 text-gray-200' 
                              : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        >
                          {palettes.map(palette => (
                            <option key={palette.id} value={palette.id}>
                              {palette.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <button
                      onClick={saveColor}
                      className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                        palettes.length > 0 ? 'flex-1' : 'w-full'
                      } ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Save Color
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Image Upload Section */}
            <div className={`rounded-lg shadow-xl p-6 mb-6 border ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800' 
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Pick Colors from Image
              </h2>
              <div 
                className={`relative rounded-lg border-2 border-dashed p-4 text-center ${
                  isDarkMode 
                    ? 'border-zinc-700 hover:border-zinc-600' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {!uploadedImage ? (
                  <div className={`${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mx-auto mb-2">
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">Drag & drop an image here, or click to select</p>
                    <p className="text-xs mt-1">You can also paste (Ctrl+V) an image</p>
                  </div>
                ) : (
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseLeave={handleCanvasMouseLeave}
                      className="rounded-lg cursor-crosshair"
                    />
                    {magnifierPosition && (
                      <div
                        className="fixed pointer-events-none"
                        style={{
                          left: magnifierPosition.x + 16,
                          top: magnifierPosition.y + 16,
                          zIndex: 50
                        }}
                      >
                        <div className={`flex flex-col gap-1.5 p-1.5 rounded-lg shadow-lg backdrop-blur-sm ${
                          isDarkMode 
                            ? 'bg-zinc-800/90 text-white' 
                            : 'bg-white/90 text-gray-900'
                        }`}>
                          {zoomedCanvas && (
                            <div className="rounded-md overflow-hidden">
                              <img
                                src={zoomedCanvas.toDataURL()}
                                alt="Zoomed pixels"
                                className="w-full h-full"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 px-0.5">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ 
                                backgroundColor: magnifierColor,
                                borderColor: isDarkMode ? '#3f3f46' : '#e5e7eb'
                              }}
                            />
                            <span className="font-mono text-xs">{magnifierColor}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {palettes.length > 0 && (
              <div className={`rounded-lg shadow-xl p-6 border ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-800' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Color Palettes
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="relative group">
                      <button
                        className={`px-3 py-1 text-sm rounded transition-colors font-medium flex items-center gap-1 ${
                          isDarkMode 
                            ? 'bg-zinc-700 text-gray-200 hover:bg-zinc-600' 
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        Export All
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className={`absolute right-0 mt-1 w-36 rounded-md shadow-lg overflow-hidden scale-0 group-hover:scale-100 origin-top-right transition-transform z-50 ${
                        isDarkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-gray-200'
                      }`}>
                        <button
                          onClick={async () => {
                            const data = JSON.stringify(palettes, null, 2);
                            await saveFileWithPicker(data, 'all-palettes.json', 'application/json');
                          }}
                          className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                            isDarkMode 
                              ? 'text-gray-200 hover:bg-zinc-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          JSON
                        </button>
                        <button
                          onClick={async () => {
                            const cssContent = palettes.map(palette => 
                              `/* ${palette.name} */\n` +
                              palette.colors.map(color => 
                                `--${palette.name.toLowerCase().replace(/\s+/g, '-')}-${color.tag.toLowerCase().replace(/\s+/g, '-')}: ${color.color};`
                              ).join('\n')
                            ).join('\n\n');
                            const content = `:root {\n${cssContent}\n}`;
                            await saveFileWithPicker(content, 'all-palettes.css', 'text/css');
                          }}
                          className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                            isDarkMode 
                              ? 'text-gray-200 hover:bg-zinc-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          CSS Variables
                        </button>
                        <button
                          onClick={async () => {
                            const scssContent = palettes.map(palette => 
                              `// ${palette.name}\n` +
                              palette.colors.map(color => 
                                `$${palette.name.toLowerCase().replace(/\s+/g, '-')}-${color.tag.toLowerCase().replace(/\s+/g, '-')}: ${color.color};`
                              ).join('\n')
                            ).join('\n\n');
                            await saveFileWithPicker(scssContent, 'all-palettes.scss', 'text/x-scss');
                          }}
                          className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                            isDarkMode 
                              ? 'text-gray-200 hover:bg-zinc-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          SCSS Variables
                        </button>
                        <button
                          onClick={async () => {
                            const txtContent = palettes.map(palette => 
                              `${palette.name}:\n\n` +
                              palette.colors.map(color => 
                                `${color.tag}:\nHEX: ${color.color}\nRGB: ${hexToRgb(color.color)}\nHSL: ${hexToHsl(color.color)}\n`
                              ).join('\n')
                            ).join('\n\n' + '='.repeat(40) + '\n\n');
                            await saveFileWithPicker(txtContent, 'all-palettes.txt', 'text/plain');
                          }}
                          className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                            isDarkMode 
                              ? 'text-gray-200 hover:bg-zinc-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Text File
                        </button>
                        <button
                          onClick={exportAsPng}
                          className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                            isDarkMode 
                              ? 'text-gray-200 hover:bg-zinc-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          PNG Image
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={createNewPalette}
                      className={`px-3 py-1 text-sm rounded transition-colors font-medium flex items-center gap-1 ${
                        isDarkMode 
                          ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                      </svg>
                      New Palette
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {palettes.map(palette => (
                    <div key={palette.id} className={`rounded-lg border p-4 ${
                      isDarkMode 
                        ? 'bg-zinc-800 border-zinc-700' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {editingPaletteName === palette.id ? (
                            <input
                              type="text"
                              value={newPaletteName}
                              onChange={(e) => setNewPaletteName(e.target.value)}
                              onKeyDown={(e) => handlePaletteKeyPress(e, palette.id)}
                              onBlur={() => {
                                if (newPaletteName.trim()) {
                                  renamePalette(palette.id, newPaletteName)
                                }
                              }}
                              className={`text-lg font-semibold px-2 py-1 rounded ${
                                isDarkMode 
                                  ? 'bg-zinc-700 text-white border-zinc-600' 
                                  : 'bg-white text-gray-900 border-gray-200'
                              } border`}
                              autoFocus
                            />
                          ) : (
                            <>
                              <h3 className={`text-lg font-semibold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {palette.name}
                              </h3>
                              <button
                                onClick={() => {
                                  setEditingPaletteName(palette.id)
                                  setNewPaletteName(palette.name)
                                }}
                                className={`p-1 rounded-full transition-colors ${
                                  isDarkMode 
                                    ? 'hover:bg-zinc-700' 
                                    : 'hover:bg-gray-200'
                                }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative group">
                            <button
                              className={`px-3 py-1 text-sm rounded transition-colors font-medium flex items-center gap-1 ${
                                isDarkMode 
                                  ? 'bg-zinc-700 text-gray-200 hover:bg-zinc-600' 
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              Export
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <div className={`absolute right-0 mt-1 w-36 rounded-md shadow-lg overflow-hidden scale-0 group-hover:scale-100 origin-top-right transition-transform z-50 ${
                              isDarkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-gray-200'
                            }`}>
                              <button
                                onClick={async () => {
                                  const data = JSON.stringify(palette, null, 2);
                                  await saveFileWithPicker(data, `${palette.name.toLowerCase().replace(/\s+/g, '-')}.json`, 'application/json');
                                }}
                                className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                                  isDarkMode 
                                    ? 'text-gray-200 hover:bg-zinc-700' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                JSON
                              </button>
                              <button
                                onClick={async () => {
                                  const cssContent = palette.colors.map(color => 
                                    `--${color.tag.toLowerCase().replace(/\s+/g, '-')}: ${color.color};`
                                  ).join('\n');
                                  const content = `:root {\n${cssContent}\n}`;
                                  await saveFileWithPicker(content, `${palette.name.toLowerCase().replace(/\s+/g, '-')}.css`, 'text/css');
                                }}
                                className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                                  isDarkMode 
                                    ? 'text-gray-200 hover:bg-zinc-700' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                CSS Variables
                              </button>
                              <button
                                onClick={async () => {
                                  const scssContent = palette.colors.map(color => 
                                    `$${palette.name.toLowerCase().replace(/\s+/g, '-')}-${color.tag.toLowerCase().replace(/\s+/g, '-')}: ${color.color};`
                                  ).join('\n');
                                  await saveFileWithPicker(scssContent, `${palette.name.toLowerCase().replace(/\s+/g, '-')}.scss`, 'text/x-scss');
                                }}
                                className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                                  isDarkMode 
                                    ? 'text-gray-200 hover:bg-zinc-700' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                SCSS Variables
                              </button>
                              <button
                                onClick={async () => {
                                  const txtContent = palette.colors.map(color => 
                                    `${color.tag}:\nHEX: ${color.color}\nRGB: ${hexToRgb(color.color)}\nHSL: ${hexToHsl(color.color)}\n`
                                  ).join('\n');
                                  await saveFileWithPicker(txtContent, `${palette.name.toLowerCase().replace(/\s+/g, '-')}.txt`, 'text/plain');
                                }}
                                className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                                  isDarkMode 
                                    ? 'text-gray-200 hover:bg-zinc-700' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                Text File
                              </button>
                              <button
                                onClick={() => exportSinglePaletteAsPng(palette)}
                                className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                                  isDarkMode 
                                    ? 'text-gray-200 hover:bg-zinc-700' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                PNG Image
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => deletePalette(palette.id)}
                            className="p-1 text-red-500 hover:text-red-600 transition-colors"
                            title="Delete palette"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 01.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 001.5.06l.3-7.5z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-auto">
                        {palette.colors.length === 0 ? (
                          <DropZone 
                            paletteId={palette.id} 
                            isDarkMode={isDarkMode} 
                            moveColor={moveColor}
                          />
                        ) : (
                          <>
                            {palette.colors.map((savedColor, index) => (
                              <React.Fragment key={`${palette.id}-${index}`}>
                                <div className="relative">
                                  <DropZoneBetween
                                    paletteId={palette.id}
                                    index={index}
                                    moveColor={moveColor}
                                    isDarkMode={isDarkMode}
                                  />
                                  <ColorCard
                                    color={savedColor}
                                    index={index}
                                    paletteId={palette.id}
                                    moveColor={moveColor}
                                    isDarkMode={isDarkMode}
                                    setColor={setColor}
                                    copyToClipboard={copyToClipboard}
                                    deleteColor={deleteColor}
                                    editingIndex={editingIndex}
                                    editingPaletteId={editingPaletteId}
                                    editingTag={editingTag}
                                    setEditingTag={setEditingTag}
                                    handleTagKeyPress={handleTagKeyPress}
                                    updateTag={updateTag}
                                    startEditing={startEditing}
                                    palettes={palettes}
                                    addColorToPalette={addColorToPalette}
                                  />
                                </div>
                              </React.Fragment>
                            ))}
                            <div className="relative">
                              <DropZoneBetween
                                paletteId={palette.id}
                                index={palette.colors.length}
                                moveColor={moveColor}
                                isDarkMode={isDarkMode}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  )
}

export default App 
