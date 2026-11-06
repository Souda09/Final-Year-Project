import React from 'react'
import { FaPlay } from 'react-icons/fa'

// 👇 Jab apna channel ban jaye, yahan channel ID (UC...) daal dein
const YOUTUBE_CHANNEL_ID = ''

// 👇 Testing ke liye boxing video (channel ID khali ho to ye chalegi)
const TEST_VIDEO_ID = 'iAA5VXKG7zk'

const LiveVideo = ({ match }) => {
  const src = YOUTUBE_CHANNEL_ID
    ? `https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}&autoplay=1&mute=1&rel=0`
    : `https://www.youtube.com/embed/${TEST_VIDEO_ID}?autoplay=1&mute=1&rel=0`

  return (
    <div className="mb-4">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          title="Live match"
          src={src}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>

      <div className="flex items-center gap-2 mt-2 text-xs">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white font-bold">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </span>

        {match && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <FaPlay className="text-[10px]" />
            {match.player1?.full_name || 'TBD'} vs {match.player2?.full_name || 'TBD'}
          </span>
        )}
      </div>
    </div>
  )
}

export default LiveVideo