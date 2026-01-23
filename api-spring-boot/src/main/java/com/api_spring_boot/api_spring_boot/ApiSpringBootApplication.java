package com.api_spring_boot.api_spring_boot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

import javax.sql.DataSource;
import java.sql.Connection;
@SpringBootApplication
public class ApiSpringBootApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiSpringBootApplication.class, args);
	}
    @Bean
    CommandLineRunner testDatabase(DataSource dataSource) {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                System.out.println("✅ Connexion DB OK : " + connection.getMetaData().getURL());
            } catch (Exception e) {
                System.out.println("❌ Erreur de connexion DB");
                e.printStackTrace();
            }
        };}
}
