"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

// Default colors for the pixel art avatar
const DEFAULT_COLORS = [
  "#10B981", // Green (primary)
  "#059669", // Dark green
  "#34D399", // Light green
  "#000000", // Black
  "#FFFFFF", // White
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#F59E0B", // Amber
]

// Increased grid size to 16x16
const GRID_SIZE = 16

interface PixelAvatarEditorProps {
  initialData?: AvatarData | null
  onSave: (avatarData: AvatarData) => Promise<void>
}

export interface AvatarData {
  grid: string[][]
  colors: string[]
}

export function PixelAvatarEditor({ initialData, onSave }: PixelAvatarEditorProps) {
  // Initialize with default data or provided data
  const [colors] = useState<string[]>(DEFAULT_COLORS)
  const [selectedColor, setSelectedColor] = useState<string>(colors[0])
  const [grid, setGrid] = useState<string[][]>(() => {
    if (initialData?.grid) {
      // If we have existing data but it's smaller than 16x16, expand it
      if (initialData.grid.length < GRID_SIZE) {
        const newGrid = Array(GRID_SIZE)
          .fill(null)
          .map(() => Array(GRID_SIZE).fill("transparent"))

        // Copy existing data into the center of the new grid
        const offset = Math.floor((GRID_SIZE - initialData.grid.length) / 2)
        for (let i = 0; i < initialData.grid.length; i++) {
          for (let j = 0; j < initialData.grid[i].length; j++) {
            newGrid[i + offset][j + offset] = initialData.grid[i][j]
          }
        }
        return newGrid
      }
      return initialData.grid
    }

    // Create empty grid
    return Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill("transparent"))
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  // Handle cell click to change color
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const newGrid = [...grid]
    newGrid[rowIndex][colIndex] = newGrid[rowIndex][colIndex] === selectedColor ? "transparent" : selectedColor
    setGrid(newGrid)
  }

  // Handle mouse down to start drawing
  const handleMouseDown = (rowIndex: number, colIndex: number) => {
    setIsDrawing(true)
    handleCellClick(rowIndex, colIndex)
  }

  // Handle mouse enter to continue drawing if mouse is down
  const handleMouseEnter = (rowIndex: number, colIndex: number) => {
    if (isDrawing) {
      handleCellClick(rowIndex, colIndex)
    }
  }

  // Handle mouse up to stop drawing
  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  // Clear the grid
  const handleClear = () => {
    setGrid(
      Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill("transparent")),
    )
  }

  // Save the avatar
  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave({ grid, colors })
      toast({
        title: "Avatar saved",
        description: "Your pixel avatar has been updated successfully",
      })
    } catch (error) {
      console.error("Error saving avatar:", error)
      toast({
        title: "Error",
        description: "Failed to save your avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border-green-900/50 bg-black text-green-500">
      <CardHeader>
        <CardTitle className="text-center">Customize Your Pixel Avatar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Color selector */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="text-sm">Select color:</div>
            <div className="flex flex-wrap gap-2 max-w-xs">
              {colors.map((color, index) => (
                <button
                  key={index}
                  className={`w-6 h-6 rounded-full border ${selectedColor === color ? "border-white ring-2 ring-green-500" : "border-gray-700"}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Pixel grid - smaller cells for 16x16 grid */}
          <div
            className="grid gap-0 p-2 bg-black border border-green-900/50 rounded-md"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: "fit-content",
            }}
            onMouseLeave={handleMouseUp}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className="w-4 h-4 border border-green-900/20 hover:border-green-500 transition-colors"
                  style={{ backgroundColor: cell }}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onMouseUp={handleMouseUp}
                  aria-label={`Toggle pixel at row ${rowIndex}, column ${colIndex}`}
                />
              )),
            )}
          </div>

          {/* Preview */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Preview:</h3>
            <div className="border border-green-900/50 p-2 rounded-md bg-black">
              <div className="w-16 h-16 mx-auto">
                <PixelAvatarDisplay avatarData={{ grid, colors }} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleClear}
          className="border-green-900 text-green-500 hover:bg-green-900/20"
          disabled={isSaving}
        >
          Clear
        </Button>
        <Button onClick={handleSave} className="bg-green-900 text-green-500 hover:bg-green-800" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Avatar"}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Component to display a pixel avatar
export function PixelAvatarDisplay({
  avatarData,
  size = "md",
  className = "",
}: {
  avatarData: AvatarData | null
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}) {
  // Size mappings
  const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  }

  if (!avatarData || !avatarData.grid) {
    // Default smiley face if no avatar data
    return (
      <div
        className={`relative ${sizeClasses[size]} ${className} flex items-center justify-center rounded-full border-2 border-green-500 text-green-400`}
      >
        <span className="text-green-500">:)</span>
      </div>
    )
  }

  const gridSize = avatarData.grid.length

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden border-2 border-green-900/50`}>
      <div
        className="grid w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {avatarData.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => <div key={`${rowIndex}-${colIndex}`} style={{ backgroundColor: cell }} />),
        )}
      </div>
    </div>
  )
}
