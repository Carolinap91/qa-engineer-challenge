@ui
Feature: Born Today - Celebridades nacidas ayer
  Como usuario de IMDb quiero buscar celebridades nacidas ayer y
  capturar evidencia del 3er resultado.

  Scenario: Capturar screenshot del 3er resultado nacido ayer
    Given que estoy en la página principal de IMDb
    When despliego el menú y navego a la sección "Born Today"
    And elimino la búsqueda por defecto
    And despliego el filtro "Birthday" y busco "Celebrities born yesterday"
    And hago click en el 3er nombre de la lista
    Then debería tomar un screenshot de la página del resultado
