package net.raysforge.spacepirates;

import java.io.FileReader;
import javax.script.ScriptEngineManager;

public class JavaScriptRunner {
	public static void main(String[] args) throws Exception {
		FileReader reader = new FileReader(args[0]);
		new ScriptEngineManager().getEngineByName("js").eval(reader);
		reader.close();
	}
}
