package net.raysforge.spacepirates;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.CharBuffer;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.apache.catalina.websocket.MessageInbound;
import org.apache.catalina.websocket.WsOutbound;

import com.mongodb.DBCursor;
import com.mongodb.DBObject;

public final class SpaceClient extends MessageInbound {

	private int id;
	
	static List<SpaceClient> clients = new ArrayList<SpaceClient>();
	private Random rand = new Random();
	
	
	public SpaceClient() {
		id = rand.nextInt(Integer.MAX_VALUE) + 1;
		while (containsID(id)) {
			id = rand.nextInt(Integer.MAX_VALUE) + 1;
		}
	}

	@Override
	protected void onOpen(WsOutbound outbound) {
		log("onOpen");
		clients.add(this);
	}

	private boolean containsID(int id) {
		for (SpaceClient client : clients) {
			if (client.id == id)
				return true;
		}
		return false;
	}

	@Override
	protected void onClose(int status) {
		log("onClose");
		clients.remove(this);
	}

	ByteBuffer msgCopy = null;

	@Override
	protected void onBinaryMessage(ByteBuffer message) throws IOException {

		//log("binaryMessage: " + debugByteBufferHex(message.array()));

		if (msgCopy == null || msgCopy.capacity() != message.capacity())
		{
			msgCopy = ByteBuffer.allocate(message.capacity());
			msgCopy.order(ByteOrder.LITTLE_ENDIAN);
		}
		copy(message, msgCopy);
		
		msgCopy.putInt(64, this.id);

		for (SpaceClient client : clients) {
			if (client == this)
				continue;
			//log("sending to: " + client + " " + message.get(0));
			client.getWsOutbound().writeBinaryMessage(msgCopy);
		}

	}

	@Override
	protected void onTextMessage(CharBuffer message) throws IOException {
		log("textMessage: " + message);
		try {
			handleTextMessage(message);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void handleTextMessage(CharBuffer message2) throws IOException {
		String message = message2.toString(); // cache the value cause the CharBuffer can get changed under our feet.
		boolean distribute = true;

		if (message.startsWith("+block:")) {
			SpaceDatabase.insertBlock(message.substring(7));
		} else if (message.startsWith("-block:")) {
			SpaceDatabase.deleteBlock(message.substring(7));
		} else if (message.startsWith("send blocks")) {
			distribute = false;

			log("sending blocks to client");
			int count = 0;
			WsOutbound wsOutbound = this.getWsOutbound();
			DBCursor blocks = SpaceDatabase.getBlocks();
			for (DBObject block : blocks) {

				String pos = (String) block.get("_id");
				try {
					wsOutbound.writeTextMessage(CharBuffer.wrap("+block:" + pos));
					count++;
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			wsOutbound.flush();
			log("sent blocks count: " + count);
		}

		if (distribute) {
			for (SpaceClient client : clients) {
				if (client == this)
					continue;
				log("sending to: " + client.id + " " + message);
				client.getWsOutbound().writeTextMessage(CharBuffer.wrap(message));
			}
		}
	}

	private void log(String msg) {
		System.out.println("WebSocket " + this.id + " - " + msg);
	}

	public static String debugByteBufferHex(byte[] read) {
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < read.length; i++) {
			String hex = Integer.toHexString(0xff & read[i]).toUpperCase();
			if (hex.length() == 1) {
				sb.append('0');
			}
			sb.append(hex);
		}
		return sb.toString();
	}

	public static void copy(ByteBuffer src, ByteBuffer dest) {
		src.rewind();
		dest.rewind();
		dest.put(src);
		src.rewind();
		dest.flip();
	}
	
	@Override
	public String toString() {
		return ""+id;
	}
}