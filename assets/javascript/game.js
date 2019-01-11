const bgm = document.getElementById("bgm");
function bgmPlay() {
  bgm.play();
}
function bgmPause() {
  bgm.pause();
}

//Global letiables
$(document).ready(function() {
  //audio clips

  const audio = new Audio("assets/audio/imperial_march.mp3");
  const jabba = new Audio("assets/audio/jabba.mp3");
  const blaster = new Audio("assets/audio/blaster-firing.mp3");
  const jediKnow = new Audio("assets/audio/jedi-know.mp3");
  const lightsaber = new Audio("assets/audio/light-saber-on.mp3");
  const rtwoo = new Audio("assets/audio/R2D2.mp3");

  //Array of Playable Characters
  let characters = {
    jango: {
      name: "jango",
      health: 120,
      attack: 8,
      imageUrl: "assets/images/jango.png",
      enemyAttackBack: 15
    },
    darth: {
      name: "darth",
      health: 150,
      attack: 14,
      imageUrl: "assets/images/1darth_vader.png",
      enemyAttackBack: 5
    },
    luke: {
      name: "luke",
      health: 150,
      attack: 8,
      imageUrl: "assets/images/luke_skywalker.png",
      enemyAttackBack: 20
    },
    rancor: {
      name: "rancor",
      health: 180,
      attack: 7,
      imageUrl: "assets/images/rancor.png",
      enemyAttackBack: 20
    }
  };

  let currSelectedCharacter;
  let currDefender;
  let combatants = [];
  let indexofSelChar;
  let attackResult;
  let turnCounter = 1;
  let killCount = 0;

  let renderOne = function(character, renderArea, makeChar) {
    //character: obj, renderArea: class/id, makeChar: string
    let charDiv = $(
      "<div class='character' data-name='" + character.name + "'>"
    );
    let charName = $("<div class='character-name'>").text(character.name);
    let charImage = $("<img alt='image' class='character-image'>").attr(
      "src",
      character.imageUrl
    );
    let charHealth = $("<div class='character-health'>").text(character.health);
    charDiv
      .append(charName)
      .append(charImage)
      .append(charHealth);
    $(renderArea).append(charDiv);
    //Capitalizes the first letter in characters name
    // $('.character').css('textTransform', 'capitalize');
    // conditional render
    if (makeChar == "enemy") {
      $(charDiv).addClass("enemy");
    } else if (makeChar == "defender") {
      currDefender = character;
      $(charDiv).addClass("target-enemy");
    }
  };

  // Create function to render game message to DOM
  let renderMessage = function(message) {
    let gameMesageSet = $("#gameMessage");
    let newMessage = $("<div>").text(message);
    gameMesageSet.append(newMessage);

    if (message == "clearMessage") {
      gameMesageSet.text("");
    }
  };

  let renderCharacters = function(charObj, areaRender) {
    //render all characters
    if (areaRender == "#characters-section") {
      $(areaRender).empty();
      for (let key in charObj) {
        if (charObj.hasOwnProperty(key)) {
          renderOne(charObj[key], areaRender, "");
        }
      }
    }
    //render player character
    if (areaRender == "#selected-character") {
      $("#selected-character").prepend("Your Character");
      renderOne(charObj, areaRender, "");
      $("#attack-button").css("visibility", "visible");
    }
    //render combatants
    if (areaRender == "#available-to-attack-section") {
      $("#available-to-attack-section").prepend("Choose Your Next Opponent");
      for (let i = 0; i < charObj.length; i++) {
        renderOne(charObj[i], areaRender, "enemy");
      }
      //render one enemy to defender area
      $(document).on("click", ".enemy", function() {
        //select an combatant to fight
        name = $(this).data("name");
        //if defernder area is empty
        if ($("#defender").children().length === 0) {
          renderCharacters(name, "#defender");
          $(this).hide();
          renderMessage("clearMessage");
        }
      });
    }
    //render defender
    if (areaRender == "#defender") {
      $(areaRender).empty();
      for (let i = 0; i < combatants.length; i++) {
        //add enemy to defender area
        if (combatants[i].name == charObj) {
          $("#defender").append("Your selected opponent");
          renderOne(combatants[i], areaRender, "defender");
        }
      }
    }
    //re-render defender when attacked
    if (areaRender == "playerDamage") {
      $("#defender").empty();
      $("#defender").append("Your selected opponent");
      renderOne(charObj, "#defender", "defender");
      lightsaber.play();
    }
    //re-render player character when attacked
    if (areaRender == "enemyDamage") {
      $("#selected-character").empty();
      renderOne(charObj, "#selected-character", "");
    }
    //render defeated enemy
    if (areaRender == "enemyDefeated") {
      $("#defender").empty();
      let gameStateMessage =
        "You have defated " +
        charObj.name +
        ", you can choose to fight another enemy.";
      renderMessage(gameStateMessage);
      blaster.play();
    }
  };
  //this is to render all characters for user to choose their computer
  renderCharacters(characters, "#characters-section");
  $(document).on("click", ".character", function() {
    name = $(this).data("name");
    //if no player char has been selected
    if (!currSelectedCharacter) {
      currSelectedCharacter = characters[name];
      for (let key in characters) {
        if (key != name) {
          combatants.push(characters[key]);
        }
      }
      $("#characters-section").hide();
      renderCharacters(currSelectedCharacter, "#selected-character");
      //this is to render all characters for user to choose fight against
      renderCharacters(combatants, "#available-to-attack-section");
    }
  });

  // ----------------------------------------------------------------
  // Create functions to enable actions between objects.
  $("#attack-button").on("click", function() {
    //if defernder area has enemy
    if ($("#defender").children().length !== 0) {
      //defender state change
      let attackMessage =
        "You attacked " +
        currDefender.name +
        " for " +
        currSelectedCharacter.attack * turnCounter +
        " damage.";
      renderMessage("clearMessage");
      //combat
      currDefender.health =
        currDefender.health - currSelectedCharacter.attack * turnCounter;

      //win condition
      if (currDefender.health > 0) {
        //enemy not dead keep playing
        renderCharacters(currDefender, "playerDamage");
        //player state change
        let counterAttackMessage =
          currDefender.name +
          " attacked you back for " +
          currDefender.enemyAttackBack +
          " damage.";
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);

        currSelectedCharacter.health =
          currSelectedCharacter.health - currDefender.enemyAttackBack;
        renderCharacters(currSelectedCharacter, "enemyDamage");
        if (currSelectedCharacter.health <= 0) {
          renderMessage("clearMessage");
          restartGame("You have been defeated...GAME OVER!!!");
          jabba.play();
          $("#attack-button").unbind("click");
        }
      } else {
        renderCharacters(currDefender, "enemyDefeated");
        killCount++;
        if (killCount >= 3) {
          renderMessage("clearMessage");
          restartGame("You Won!!!! GAME OVER!!!");
          jediKnow.play();
          // The following line will play the imperial march:
          setTimeout(function() {
            audio.play();
          }, 2000);
        }
      }
      turnCounter++;
    } else {
      renderMessage("clearMessage");
      renderMessage("No enemy here.");
      rtwoo.play();
    }
  });

  //Restarts the game - renders a reset button
  let restartGame = function(inputEndGame) {
    //When 'Restart' button is clicked, reload the page.
    let restart = $('<button class="btn">Restart</button>').click(function() {
      location.reload();
    });
    let gameState = $("<div>").text(inputEndGame);
    $("#gameMessage").append(gameState);
    $("#gameMessage").append(restart);
  };
});
