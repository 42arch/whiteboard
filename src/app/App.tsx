'use client'

import {
  CursorArrowIcon,
  BoxIcon,
  CircleIcon,
  Pencil1Icon,
  ArrowRightIcon,
  DownloadIcon,
  MarginIcon
} from '@radix-ui/react-icons'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import Konva from 'konva'
import {
  Arrow,
  Circle,
  Image,
  Layer,
  Line,
  Rect,
  Stage,
  Transformer
} from 'react-konva'
import { ACTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { KonvaEventObject } from 'konva/lib/Node'

function ActionButton({
  children,
  active,
  onClick
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-300',
        active ? 'bg-blue-600 text-white' : ''
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

type Rectangle = {
  id: string
  x: number
  y: number
  height: number
  width: number
  fillColor: string
}

type Cricle = {
  id: string
  x: number
  y: number
  radius: number
  fillColor: string
}

type Arrow = {
  id: string
  points: [number, number, number, number]
  fillColor: string
}

type FreeDraw = {
  id: string
  points: number[]
  fillColor: string
}

type BrushImage = {
  id: string
  x: number
  y: number
  image: HTMLCanvasElement
}

function App() {
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null!)
  const currentShapeId = useRef<string>()
  const [action, setAction] = useState(ACTIONS.SELECT)
  const [strokeWidth, setStrokeWidth] = useState(0)
  const [fillColor, setFillColor] = useState('#ff0000')

  const [rectangles, setRectangles] = useState<Rectangle[]>([])
  const [circles, setCircles] = useState<Cricle[]>([])
  const [arrows, setArrows] = useState<Arrow[]>([])
  const [freeDraws, setFreeDraws] = useState<FreeDraw[]>([])
  const [brushImages, setBrushImages] = useState<BrushImage[]>([])

  const isDrawing = useRef(false)
  const isDraggable = action === ACTIONS.SELECT

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const stage = stageRef.current
    if (stage) {
      stage.container().style.cursor = 'none' // Hide default cursor
      const handleMouseMove = (e: MouseEvent) => {
        setMousePos({
          x: e.clientX - stage.container().getBoundingClientRect().left,
          y: e.clientY - stage.container().getBoundingClientRect().top
        })
      }
      stage.container().addEventListener('mousemove', handleMouseMove)
      return () => {
        stage.container().removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [])

  const handlePointerDown = () => {
    if (action === ACTIONS.SELECT) return

    const stage = stageRef.current
    if (!stage) return

    const { x, y } = stage.getPointerPosition()!
    const id = nanoid()
    currentShapeId.current = id
    isDrawing.current = true

    switch (action) {
      case ACTIONS.RECTANGLE:
        setRectangles((rectangles) => [
          ...rectangles,
          {
            id,
            x,
            y,
            height: 20,
            width: 20,
            fillColor
          }
        ])
        break
      case ACTIONS.CIRCLE:
        setCircles((circles) => [
          ...circles,
          {
            id,
            x,
            y,
            radius: 10,
            fillColor
          }
        ])
        break
      case ACTIONS.ARROW:
        setArrows((arrows) => [
          ...arrows,
          {
            id,
            points: [x, y, x + 20, y + 20],
            fillColor
          }
        ])
        break
      case ACTIONS.FREEHAND:
        setFreeDraws((draws) => [
          ...draws,
          {
            id,
            points: [x, y],
            fillColor
          }
        ])
        break
      case ACTIONS.BRUSH:
        {
          const canvas = document.createElement('canvas')
          canvas.width = stage.width()
          canvas.height = stage.height()

          setBrushImages((images) => [
            ...images,
            {
              id,
              x,
              y,
              image: canvas
            }
          ])

          const context = canvas.getContext('2d')!
          context.strokeStyle = '#df4b26'
          context.lineJoin = 'round'
          context.lineWidth = 5

          console.log(999999, context)
        }

        break
      default:
        break
    }
  }

  const handlePointerMove = () => {
    if (action === ACTIONS.SELECT || !isDrawing.current) return

    const stage = stageRef.current

    if (!stage) return

    const { x, y } = stage.getPointerPosition()!

    switch (action) {
      case ACTIONS.RECTANGLE:
        setRectangles((rectangles) =>
          rectangles.map((rectangle) => {
            if (rectangle.id === currentShapeId.current) {
              return {
                ...rectangle,
                width: x - rectangle.x,
                height: y - rectangle.y
              }
            }
            return rectangle
          })
        )
        break
      case ACTIONS.CIRCLE:
        setCircles((circles) => {
          return circles.map((circle) => {
            if (circle.id === currentShapeId.current) {
              return {
                ...circle,
                radius: ((y - circle.y) ** 2 + (x - circle.x) ** 2) ** 0.5
              }
            }
            return circle
          })
        })
        break
      case ACTIONS.ARROW:
        setArrows((arrows) => {
          return arrows.map((arrow) => {
            if (arrow.id === currentShapeId.current) {
              return {
                ...arrow,
                points: [arrow.points[0], arrow.points[1], x, y]
              }
            }
            return arrow
          })
        })
        break
      case ACTIONS.FREEHAND:
        setFreeDraws((draws) => {
          return draws.map((draw) => {
            if (draw.id === currentShapeId.current) {
              return {
                ...draw,
                points: [...draw.points, x, y]
              }
            }
            return draw
          })
        })
        break
      case ACTIONS.BRUSH:
        setBrushImages((images) => {
          return images.map((image) => {
            if (image.id === currentShapeId.current) {
              return {
                ...image,
                x,
                y
              }
            }
            return image
          })
        })
        break
      default:
        break
    }
  }

  const handlePointerUp = () => {
    isDrawing.current = false
  }

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    if (action !== ACTIONS.SELECT) return
    const target = e.currentTarget
    transformerRef.current.nodes([target])
  }

  return (
    <div className='h-full w-full'>
      <div className='absolute left-1/2 top-4 z-10 flex h-12 -translate-x-1/2 items-center gap-2 rounded-lg bg-slate-100 p-2'>
        <ActionButton
          active={action === ACTIONS.SELECT}
          onClick={() => setAction(ACTIONS.SELECT)}
        >
          <CursorArrowIcon />
        </ActionButton>
        <ActionButton
          active={action === ACTIONS.RECTANGLE}
          onClick={() => setAction(ACTIONS.RECTANGLE)}
        >
          <BoxIcon />
        </ActionButton>
        <ActionButton
          active={action === ACTIONS.CIRCLE}
          onClick={() => setAction(ACTIONS.CIRCLE)}
        >
          <CircleIcon />
        </ActionButton>
        <ActionButton
          active={action === ACTIONS.ARROW}
          onClick={() => setAction(ACTIONS.ARROW)}
        >
          <ArrowRightIcon />
        </ActionButton>
        <ActionButton
          active={action === ACTIONS.FREEHAND}
          onClick={() => setAction(ACTIONS.FREEHAND)}
        >
          <Pencil1Icon />
        </ActionButton>
        <ActionButton
          active={action === ACTIONS.BRUSH}
          onClick={() => setAction(ACTIONS.BRUSH)}
        >
          <MarginIcon />
        </ActionButton>
        <ActionButton>
          <input
            type='color'
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
          />
        </ActionButton>
        <ActionButton>
          <DownloadIcon />
        </ActionButton>
      </div>

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            height={window.innerHeight}
            width={window.innerWidth}
            fill='#ffffff'
            id='bg'
            onClick={() => {
              transformerRef.current?.nodes([])
            }}
          />

          {rectangles.map((rectangle, idx) => (
            <Rect
              key={idx}
              x={rectangle.x}
              y={rectangle.y}
              // stroke={strokeColor}
              strokeWidth={2}
              fill={rectangle.fillColor}
              height={rectangle.height}
              width={rectangle.width}
              draggable={isDraggable}
              onClick={handleClick}
            />
          ))}
          {circles.map((circle, idx) => (
            <Circle
              key={idx}
              x={circle.x}
              y={circle.y}
              // stroke={strokeColor}
              strokeWidth={2}
              fill={circle.fillColor}
              radius={circle.radius}
              draggable={isDraggable}
              onClick={handleClick}
            />
          ))}
          {arrows.map((arrow) => (
            <Arrow
              key={arrow.id}
              points={arrow.points}
              stroke={'#000'}
              strokeWidth={2}
              fill={arrow.fillColor}
              draggable={isDraggable}
              onClick={handleClick}
            />
          ))}
          {freeDraws.map((draw) => (
            <Line
              key={draw.id}
              lineCap='round'
              lineJoin='round'
              points={draw.points}
              strokeWidth={strokeWidth}
              stroke={draw.fillColor}
              draggable={isDraggable}
              onClick={handleClick}
            />
          ))}
          {brushImages.map((image) => (
            <Image
              alt='xx'
              key={image.id}
              x={image.x}
              y={image.y}
              image={image.image}
            />
          ))}
          {action === ACTIONS.BRUSH && (
            <Circle
              x={mousePos.x}
              y={mousePos.y}
              radius={10}
              fill='blue'
              listening={false} // Make the circle non-interactive
            />
          )}

          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
    </div>
  )
}

export default App
