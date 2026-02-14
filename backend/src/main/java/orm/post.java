package orm;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
public class Post extends PanacheEntity {
    @Column(columnDefinition = "TEXT")
    public String content;

    public LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    public User user;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    public List<Like> likes = new ArrayList<>();
}