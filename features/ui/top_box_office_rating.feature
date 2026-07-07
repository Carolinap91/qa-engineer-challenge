@ui
Feature: Top Box Office - Calificar película
  Como usuario de IMDb quiero calificar la 2da película del Top Box Office
  con 5 estrellas.

  Scenario: Calificar con 5 estrellas la 2da película del Top Box Office
    Given que estoy en la página principal de IMDb
    When despliego el menú y navego a la sección "Top Box Office"
    And hago click en el 2do item de la lista
    And hago click en el botón "IMDb Rating"
    And hago click en el botón "Rate"
    And selecciono una calificación de 5 estrellas
    And confirmo la calificación en el modal
    Then la película debería quedar calificada con 5 estrellas
