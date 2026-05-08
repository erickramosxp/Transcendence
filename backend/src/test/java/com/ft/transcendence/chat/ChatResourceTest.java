package com.ft.transcendence.chat;

import com.ft.transcendence.base.BaseApiTest;
import com.ft.transcendence.user.UserTestContext;
import io.quarkus.test.junit.QuarkusTest;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.Collectors;

import static io.restassured.RestAssured.given;

@QuarkusTest
public class ChatResourceTest extends BaseApiTest {

    private Long createDirectChat(UserTestContext userA, UserTestContext userB) {
        return ((Number) given()
                .header("Authorization", "Bearer " + userA.token)
                .contentType("application/json")
                .body("""
                    {
                      "directUserId": %d
                    }
                """.formatted(userB.id))
                .when()
                .post("/chats/direct")
                .then()
                .statusCode(201)
                .extract()
                .path("id")).longValue();
    }

    private Long createGroupChat(UserTestContext owner, List<Long> participantIds) {
        String participantsJson = participantIds.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(", "));

        return ((Number) given()
                .header("Authorization", "Bearer " + owner.token)
                .contentType("application/json")
                .body("""
                    {
                      "chatName": "Grupo teste",
                      "participantIds": [%s]
                    }
                """.formatted(participantsJson))
                .when()
                .post("/chats/group")
                .then()
                .statusCode(201)
                .extract()
                .path("id")).longValue();
    }

    @Test
    public void testListMyChats() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser();
        UserTestContext user3 = createUser();

        Long chatId = createDirectChat(user1, user2);
        Long chatId2 = createGroupChat(user1, List.of(user2.id, user3.id));

        given()
                .header("Authorization", "Bearer " + user1.token)
                .when()
                .get("/chats?page=0&size=20")
                .then()
                .statusCode(200)
                .body("items.size()", Matchers.greaterThan(0))
                .body(("items.find { it.id == %d }.id").formatted(chatId), Matchers.equalTo(chatId.intValue()));
    }

    @Test
    public void testCreateDirectChat() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser();

        given()
                .header("Authorization", "Bearer " + user1.token)
                .contentType("application/json")
                .body("""
                {
                  "directUserId": %d
                }
            """.formatted(user2.id))
                .when()
                .post("/chats/direct")
                .then()
                .statusCode(201)
                .body("id", Matchers.notNullValue())
                .body("type", Matchers.equalTo("direct"));
    }

    @Test
    public void testCreateDirectChatWithMyselfShouldFail() {
        UserTestContext user = createUser();

        given()
                .header("Authorization", "Bearer " + user.token)
                .contentType("application/json")
                .body("""
                {
                  "directUserId": %d
                }
            """.formatted(user.id))
                .when()
                .post("/chats/direct")
                .then()
                .statusCode(400);
    }

    @Test
    public void testCreateGroupChat() {
        UserTestContext owner = createUser();
        UserTestContext member1 = createUser();
        UserTestContext member2 = createUser();

        given()
                .header("Authorization", "Bearer " + owner.token)
                .contentType("application/json")
                .body("""
                {
                  "chatName": "Grupo legal",
                  "participantIds": [%d, %d]
                }
            """.formatted(member1.id, member2.id))
                .when()
                .post("/chats/group")
                .then()
                .statusCode(201)
                .body("id", Matchers.notNullValue())
                .body("type", Matchers.equalTo("group"));
    }

    @Test
    public void testCreateGroupChatBlankNameShouldFail() {
        UserTestContext owner = createUser();
        UserTestContext member = createUser();

        given()
                .header("Authorization", "Bearer " + owner.token)
                .contentType("application/json")
                .body("""
                {
                  "chatName": "   ",
                  "participantIds": [%d]
                }
            """.formatted(member.id))
                .when()
                .post("/chats/group")
                .then()
                .statusCode(400);
    }

    @Test
    public void testCreateGroupChatEmptyParticipantsShouldFail() {
        UserTestContext owner = createUser();

        given()
                .header("Authorization", "Bearer " + owner.token)
                .contentType("application/json")
                .body("""
                {
                  "chatName": "Grupo sem participantes",
                  "participantIds": []
                }
            """)
                .when()
                .post("/chats/group")
                .then()
                .statusCode(400);
    }

    @Test
    public void testCreateGroupChatWithSelfInParticipantsShouldFail() {
        UserTestContext owner = createUser();
        UserTestContext member = createUser();

        given()
                .header("Authorization", "Bearer " + owner.token)
                .contentType("application/json")
                .body("""
                {
                  "chatName": "Grupo",
                  "participantIds": [%d, %d]
                }
            """.formatted(owner.id, member.id))
                .when()
                .post("/chats/group")
                .then()
                .statusCode(400);
    }

    @Test
    public void testSendMessage() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser();

        Long chatId = createDirectChat(user1, user2);

        given()
                .header("Authorization", "Bearer " + user1.token)
                .contentType("application/json")
                .body("""
                {
                  "text": "Olá",
                  "mediaUrl": null,
                  "replyToId": null
                }
            """)
                .when()
                .post("/chats/{chatId}/messages", chatId)
                .then()
                .statusCode(201)
                .body("id", Matchers.notNullValue())
                .body("text", Matchers.equalTo("Olá"));
    }

    @Test
    public void testSendMessageWithReply() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser();

        Long chatId = createDirectChat(user1, user2);

        Long firstMessageId = ((Number) given()
                .header("Authorization", "Bearer " + user1.token)
                .contentType("application/json")
                .body("""
                {
                  "text": "Mensagem original",
                  "mediaUrl": null,
                  "replyToId": null
                }
            """)
                .when()
                .post("/chats/{chatId}/messages", chatId)
                .then()
                .statusCode(201)
                .extract()
                .path("id")).longValue();

        given()
                .header("Authorization", "Bearer " + user1.token)
                .contentType("application/json")
                .body("""
                {
                  "text": "Resposta",
                  "mediaUrl": null,
                  "replyToId": %d
                }
            """.formatted(firstMessageId))
                .when()
                .post("/chats/{chatId}/messages", chatId)
                .then()
                .statusCode(201)
                .body("replyToId", Matchers.equalTo(firstMessageId.intValue()));
    }

    @Test
    public void testSendMessageInChatWhereUserIsNotParticipantShouldFail() {
        UserTestContext owner = createUser();
        UserTestContext participant = createUser();
        UserTestContext intruder = createUser();

        Long chatId = createDirectChat(owner, participant);

        given()
                .header("Authorization", "Bearer " + intruder.token)
                .contentType("application/json")
                .body("""
                {
                  "text": "Não deveria enviar",
                  "mediaUrl": null,
                  "replyToId": null
                }
            """)
                .when()
                .post("/chats/{chatId}/messages", chatId)
                .then()
                .statusCode(404);
    }

    @Test
    public void testSendMessageWithInvalidReplyShouldFail() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser();
        UserTestContext user3 = createUser();

        Long chat1 = createDirectChat(user1, user2);
        Long chat2 = createDirectChat(user1, user3);

        Long messageInChat2 = ((Number) given()
                .header("Authorization", "Bearer " + user1.token)
                .contentType("application/json")
                .body("""
                {
                  "text": "Msg chat2",
                  "mediaUrl": null,
                  "replyToId": null
                }
            """)
                .when()
                .post("/chats/{chatId}/messages", chat2)
                .then()
                .statusCode(201)
                .extract()
                .path("id")).longValue();

        given()
                .header("Authorization", "Bearer " + user1.token)
                .contentType("application/json")
                .body("""
                {
                  "text": "Resposta inválida",
                  "mediaUrl": null,
                  "replyToId": %d
                }
            """.formatted(messageInChat2))
                .when()
                .post("/chats/{chatId}/messages", chat1)
                .then()
                .statusCode(400);
    }

    @Test
    public void testListMessages() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser();

        Long chatId = createDirectChat(user1, user2);

        for (int i = 0; i < 5; i++) {
            given()
                    .header("Authorization", "Bearer " + user1.token)
                    .contentType("application/json")
                    .body("""
                    {
                      "text": "Msg %d",
                      "mediaUrl": null,
                      "replyToId": null
                    }
                """.formatted(i))
                    .when()
                    .post("/chats/{chatId}/messages", chatId)
                    .then()
                    .statusCode(201);
        }

        given()
                .header("Authorization", "Bearer " + user1.token)
                .when()
                .get("/chats/{chatId}/messages?page=0&size=3", chatId)
                .then()
                .statusCode(200)
                .body("items.size()", Matchers.equalTo(3))
                .body("hasMore", Matchers.equalTo(true));
    }

    @Test
    public void testListMessagesWithInvalidPageShouldFail() {
        UserTestContext user1 = createUser();
        UserTestContext user2 = createUser();

        Long chatId = createDirectChat(user1, user2);

        given()
                .header("Authorization", "Bearer " + user1.token)
                .when()
                .get("/chats/{chatId}/messages?page=-1&size=0", chatId)
                .then()
                .statusCode(400);
    }

    @Test
    public void testListMessagesForNonParticipantShouldFail() {
        UserTestContext owner = createUser();
        UserTestContext participant = createUser();
        UserTestContext intruder = createUser();

        Long chatId = createDirectChat(owner, participant);

        given()
                .header("Authorization", "Bearer " + intruder.token)
                .when()
                .get("/chats/{chatId}/messages?page=0&size=10", chatId)
                .then()
                .statusCode(404);
    }
}
