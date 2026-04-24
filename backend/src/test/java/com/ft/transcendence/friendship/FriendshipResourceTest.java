package com.ft.transcendence.friendship;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.user.UserTestContext;
import io.quarkus.logging.Log;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;

@QuarkusTest
public class FriendshipResourceTest extends BaseApiTest {

    @Test
    public void testSendFriendRequest() {

        UserTestContext userA = createUser();
        UserTestContext userB = createUser();

        given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .post("/friendships/request/" + userB.id)
                .then()
                .statusCode(201);
    }

    @Test
    public void testAcceptFriendRequest() {

        Log.info("Creating users");
        UserTestContext userA = createUser();
        UserTestContext userB = createUser();
        Log.infof("Users created: A=%d, B=%d", userA.id, userB.id);

        Log.info("Step 1: Sending a friend request");
        given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .post("/friendships/request/" + userB.id)
                .then()
                .statusCode(201);

        Log.info("Step 2: Retrieving the ID of the pending request");
        Long friendshipId = ((Number) given()
                .header("Authorization", "Bearer " + userB.token)
                .when()
                .get("/friendships/requests/pending")
                .then()
                .statusCode(200)
                .body("size()", is(1))
                .extract()
                .path("[0].friendshipId"))
                .longValue();

        Log.infof("Friendship ID captured: %d. Step 3: Accepting request", friendshipId);
        given()
                .header("Authorization", "Bearer " + userB.token)
                .when()
                .post("/friendships/accept/" + friendshipId)
                .then()
                .statusCode(200);

        Log.info("Step 4: Checking if the friendship has been completed");
        given()
                .header("Authorization", "Bearer " + userA.token)
                .when()
                .get("/friendships")
                .then()
                .statusCode(200)
                .body("items.size()", is(1))
                .body("items[0].friendId", is(userB.id.intValue()));
    }

//    public void testSecurityCannotAcceptOwnRequest() {}


}
