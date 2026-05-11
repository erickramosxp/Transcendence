package com.ft.transcendence.chat;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.user.UserTestContext;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.*;

@QuarkusTest
public class ChatParticipantResourceTest extends BaseApiTest {

    private Long createGroupChat(UserTestContext admin, UserTestContext... participants) {
        String ids = java.util.Arrays.stream(participants)
                .map(p -> {
                    makeFriends(admin, p);
                    return String.valueOf(p.id);
                })
                .collect(java.util.stream.Collectors.joining(","));

        return ((Number) auth(admin)
                .body("""
                {
                  "chatName": "Grupo de teste",
                  "participantIds": [%s]
                }
                """.formatted(ids))
                .when()
                .post("/chats/group")
                .then()
                .statusCode(201)
                .extract()
                .path("id"))
                .longValue();
    }

    @Test
    public void testGetGroupParticipants() {
        UserTestContext admin = createUser();
        UserTestContext memberA = createUser();
        UserTestContext memberB = createUser();

        Long chatId = createGroupChat(admin, memberA, memberB);

        auth(admin)
                .when()
                .get("/chats/" + chatId + "/participants")
                .then()
                .statusCode(200)
                .body("items.size()", is(3))
                .body("items.username", hasItems(admin.username, memberA.username, memberB.username));
    }

    @Test
    public void testAddParticipant() {
        UserTestContext admin = createUser();
        UserTestContext memberA = createUser();
        UserTestContext newMember = createUser();

        Long chatId = createGroupChat(admin, memberA);

        makeFriends(admin, newMember);

        auth(admin)
                .body("""
                { "userId": %d }
                """.formatted(newMember.id))
                .when()
                .post("/chats/" + chatId + "/participants")
                .then()
                .statusCode(201);

        auth(admin)
                .when()
                .get("/chats/" + chatId + "/participants")
                .then()
                .statusCode(200)
                .body("items.size()", is(3))
                .body("items.username", hasItem(newMember.username));
    }

    @Test
    public void testRemoveParticipant() {
        UserTestContext admin = createUser();
        UserTestContext memberA = createUser();
        UserTestContext memberB = createUser();

        Long chatId = createGroupChat(admin, memberA, memberB);

        auth(admin)
                .when()
                .delete("/chats/" + chatId + "/participants/" + memberA.id)
                .then()
                .statusCode(204);

        auth(admin)
                .when()
                .get("/chats/" + chatId + "/participants")
                .then()
                .statusCode(200)
                .body("items.size()", is(2))
                .body("items.username", not(hasItem(memberA.username)));
    }
}
