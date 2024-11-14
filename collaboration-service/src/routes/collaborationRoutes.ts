import express from 'express';
import { joinRoom, createRoom, getRoomData, setRoomInactive, getRoomId, leaveRoom, joinOldRoom, getOldRoomData } from '../controllers/collaborationController';
import { verifyJWT } from '../middleware/jwt-authentication';
const router = express.Router();

router.post('/join', verifyJWT, joinRoom);
router.post('/join/:roomId', verifyJWT, joinOldRoom);
router.post('/createRoom', createRoom);
router.post('/leaveRoom', verifyJWT, leaveRoom);
router.get('/data', verifyJWT, getRoomData);
router.get('/data/:roomId', verifyJWT, getOldRoomData);
router.post('/setInactive', setRoomInactive);
router.get('/current', verifyJWT, getRoomId);

export default router;
