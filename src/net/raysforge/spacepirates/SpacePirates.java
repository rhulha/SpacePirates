package net.raysforge.spacepirates;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/*")
public class SpacePirates extends HttpServlet {

	@Override
	protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println(request.getContextPath() + request.getServletPath() + request.getPathInfo());
		response.getWriter().write("Hello");
	}

}
