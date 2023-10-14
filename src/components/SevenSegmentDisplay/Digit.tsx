import React, { useContext } from 'react'
import { Digit, SegmentID } from './types'
import Segment from './Segment'
import { isSegmentActive } from './utils'
import { SevenSegmentDisplayContext } from './Provider'

const segments: SegmentID[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

export interface DigitProps {
  value: Digit
}

const Digit: React.FC<DigitProps> = props => {
  const { value } = props
  const { digitSize, segmentThickness } = useContext(SevenSegmentDisplayContext)

  const aspectRatio = 0.5 * (1 + segmentThickness / digitSize)
  const height = digitSize
  const width = height * aspectRatio

  return (
    <div className="relative w-6 h-8" style={{ width, height }}>
      {segments.map(segment => (
        <Segment key={segment} segmentId={segment} isActive={isSegmentActive(segment, value)} />
      ))}
    </div>
  )
}

export default Digit
