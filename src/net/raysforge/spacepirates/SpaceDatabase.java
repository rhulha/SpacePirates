package net.raysforge.spacepirates;

import java.net.UnknownHostException;

import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.Mongo;
import com.mongodb.MongoException;
import com.mongodb.WriteConcern;

public class SpaceDatabase {
	
	
	static Mongo m=null;
	
	public static DB getDB()
	{
		if( m == null){
			try {
				m = new Mongo("ds045107.mongolab.com", 45107);
				DB db = m.getDB("hon");
				db.authenticate("hon", "APIAccess".toCharArray());
				db.setWriteConcern(WriteConcern.NONE);
				return db;
			} catch (UnknownHostException e) {
				e.printStackTrace();
			} catch (MongoException e) {
				e.printStackTrace();
			}
			return null;
		}
		return m.getDB("hon");
	}

	static DBCollection coll = null;
	
	public static DBCollection getCollection()
	{
		DB db = getDB();
		if( db == null)
			return null;
		if( coll == null)
			coll = db.getCollection("SpacePirates");
		return coll;
	}


	public static void insertBlock(String pos) {
		//System.out.println("SpaceDatabase.insertBlock: " + pos);
		DBCollection coll = getCollection();
		if( coll == null)
			return;
		coll.save(new BasicDBObject("_id", pos));
	}

	public static DBCursor getBlocks() {
		DBCollection coll = getCollection();
		return coll.find();
	}
	
	public static void main(String[] args) {
		DBCursor blocks = getBlocks();
		for (DBObject block : blocks) {
			System.out.println(block.get("_id"));
		}
	}

	public static void deleteBlock(String pos) {
		DBCollection coll = getCollection();
		if( coll == null)
			return;
		coll.remove(new BasicDBObject("_id", pos));
	}

}
