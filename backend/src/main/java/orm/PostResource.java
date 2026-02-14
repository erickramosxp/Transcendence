package orm;


import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/posts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PostResource {

    @GET
    public List<Post> listAll() {
        return Post.list("order by createdAt desc");
    }

    @POST
    @Path("/user/{userId}")
    @Transactional
    public Response createPost(@PathParam("userId") Long userId, Post post) {
        User user = User.findById(userId);
        if (user == null) return Response.status(Response.Status.NOT_FOUND).build();
        
        post.user = user;
        post.persist();
        return Response.status(Response.Status.CREATED).entity(post).build();
    }

    @POST
    @Path("/{postId}/like/{userId}")
    @Transactional
    public Response like(@PathParam("postId") Long postId, @PathParam("userId") Long userId) {
        Post post = Post.findById(postId);
        User user = User.findById(userId);
        
        if (post == null || user == null) return Response.status(Response.Status.NOT_FOUND).build();

        // Evita like duplicado (importante para integridade de dados)
        if (Like.count("post = ?1 and user = ?2", post, user) > 0) {
            return Response.status(Response.Status.CONFLICT).build();
        }

        Like like = new Like();
        like.post = post;
        like.user = user;
        like.persist();
        return Response.status(Response.Status.CREATED).build();
    }
}