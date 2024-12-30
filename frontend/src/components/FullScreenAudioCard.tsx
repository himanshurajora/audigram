import { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Person,
  MusicNote,
  Close,
} from '@mui/icons-material';
import WaveSurfer from 'wavesurfer.js';

interface Comment {
  id: string;
  text: string;
  user: {
    username: string;
    avatar?: string;
  };
}

interface FullScreenAudioCardProps {
  audio: {
    id: string;
    title: string;
    description: string;
    filePath: string;
    user: {
      username: string;
      avatar?: string;
    };
    likes: number;
    comments: number;
    isLiked: boolean;
  };
  onLike: () => void;
  onComment: () => void;
  onUserClick: () => void;
  isVisible: boolean;
  canAutoplay: boolean;
}

const FullScreenAudioCard = ({
  audio,
  onLike,
  onComment,
  onUserClick,
  isVisible,
  canAutoplay,
}: FullScreenAudioCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(255, 255, 255, 0.5)',
        progressColor: '#fff',
        cursorColor: 'transparent',
        barWidth: 2,
        barGap: 3,
        height: 100,
        barRadius: 3,
        normalize: true,
        interact: false,
      });

      const audioUrl = `http://localhost:5000/${audio.filePath.startsWith('/') ? audio.filePath.slice(1) : audio.filePath}`;
      wavesurferRef.current.load(audioUrl);

      wavesurferRef.current.on('ready', () => {
        setIsLoading(false);
        if (isVisible && canAutoplay) {
          wavesurferRef.current?.play();
        }
      });

      wavesurferRef.current.on('audioprocess', () => {
        if (wavesurferRef.current) {
          setProgress(wavesurferRef.current.getCurrentTime() / wavesurferRef.current.getDuration() * 100);
        }
      });

      wavesurferRef.current.on('finish', () => {
        if (wavesurferRef.current && isVisible) {
          wavesurferRef.current.play();
        }
      });

      wavesurferRef.current.on('error', (err) => {
        console.error('WaveSurfer error:', err);
        setIsLoading(false);
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audio.filePath, isVisible, canAutoplay]);

  // Handle visibility changes
  useEffect(() => {
    if (!wavesurferRef.current || isLoading) return;

    if (isVisible && canAutoplay) {
      wavesurferRef.current.play();
    } else {
      wavesurferRef.current.pause();
    }
  }, [isVisible, canAutoplay, isLoading]);

  const handleCommentClick = () => {
    setShowComments(true);
    onComment();
  };

  return (
    <Box className="absolute inset-0 bg-black">
      {/* Gradient overlay */}
      <Box className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-70" />

      {/* Audio visualization */}
      <Box 
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 -mt-8"
        style={{ opacity: isLoading ? 0 : 1 }}
      >
        <Box className="w-full px-6">
          <div 
            ref={waveformRef} 
            className="w-full transition-transform duration-300"
            style={{ 
              transform: !isLoading ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        </Box>
      </Box>

      {/* Loading spinner */}
      {isLoading && (
        <Box className="absolute inset-0 flex items-center justify-center">
          <CircularProgress size={60} className="text-white" />
        </Box>
      )}

      {/* Right sidebar actions */}
      <Box className="absolute right-4 bottom-20 flex flex-col gap-4 items-center">
        <Box className="flex flex-col items-center">
          <IconButton 
            onClick={onLike} 
            className="text-white transform transition-transform duration-200 hover:scale-110"
          >
            {audio.isLiked ? (
              <Favorite className="text-red-500" fontSize="large" />
            ) : (
              <FavoriteBorder fontSize="large" />
            )}
          </IconButton>
          <Typography className="text-white text-sm">{audio.likes}</Typography>
        </Box>

        <Box className="flex flex-col items-center">
          <IconButton 
            onClick={handleCommentClick}
            className="text-white transform transition-transform duration-200 hover:scale-110"
          >
            <Comment fontSize="large" />
          </IconButton>
          <Typography className="text-white text-sm">{audio.comments}</Typography>
        </Box>
      </Box>

      {/* Bottom info */}
      <Box className="absolute bottom-16 left-0 right-0 p-6 text-white">
        <Box className="flex items-center gap-2 mb-2">
          <MusicNote className="text-sm" />
          <Typography variant="body1" className="font-semibold">
            {audio.title}
          </Typography>
        </Box>
        <Typography variant="body2" className="opacity-80 font-medium">
          @{audio.user.username}
        </Typography>
        <Typography variant="body2" className="opacity-60 mt-2">
          {audio.description}
        </Typography>
      </Box>

      {/* Comments overlay */}
      {showComments && (
        <Box 
          className="absolute inset-0 bg-black bg-opacity-90 z-50 transition-opacity duration-300"
          onClick={() => setShowComments(false)}
        >
          <Box 
            className="absolute bottom-16 left-0 right-0 bg-gray-900 rounded-t-xl p-4"
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: 'calc(100vh - 4rem)' }}
          >
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6" className="text-white">
                Comments ({audio.comments})
              </Typography>
              <IconButton 
                onClick={() => setShowComments(false)}
                className="text-white"
              >
                <Close />
              </IconButton>
            </Box>
            <Box className="overflow-y-auto max-h-[calc(100vh-8rem)]">
              {/* Add comment input and list here */}
              <Typography className="text-gray-400 text-center py-4">
                Comments coming soon...
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FullScreenAudioCard; 