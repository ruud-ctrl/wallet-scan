import { useEffect, useState, useRef } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  Alert,
  Box,
  Paper,
  CircularProgress,
} from '@mui/material';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000'); // Adjust if needed

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!connectedRef.current) {
      connectedRef.current = true;

      // Listen for each item
      socket.on('item', (data) => {
        setOutput((prev) => [...prev, data.value]);
      });

      // Final message
      socket.on('done', () => {
        setLoading(false);
      });

      // Error handler
      socket.on('error', (data) => {
        setError(data.message || 'An error occurred');
        setLoading(false);
      });

      // Optional: handle disconnect
      socket.on('disconnect', () => {
        setLoading(false);
      });
    }

    // Cleanup
    return () => {
      socket.off('item');
      socket.off('done');
      socket.off('error');
    };
  }, []);

  const handleSubmit = () => {
    if (!input.trim()) {
      setError('Input cannot be empty.');
      return;
    }

    setError('');
    setOutput([]);
    setLoading(true);

    socket.emit('start_processing', { text: input });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Text Processor (Socket.IO)
        </Typography>

        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <TextField
            fullWidth
            label="Enter text"
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            error={!!error}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Process'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {output.length > 0 && (
          <>
            <Typography variant="h6">Streaming Output:</Typography>
            <List>
              {output.map((item, index) => (
                <ListItem key={index}>{item}</ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default App;
