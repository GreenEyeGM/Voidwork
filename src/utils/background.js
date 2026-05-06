export function createBackground(scene,smallAsteroids,midAsteroids,maxAsteroids) {
        console.log('Creating background');
        let gfx = scene.add.graphics();
        
        //Small Asteroids
        for (let asteroid = 0; asteroid < smallAsteroids; asteroid++) {

        let y = Phaser.Math.Between(0, scene.scale.height);
        let x = Phaser.Math.Between(0, scene.scale.width);

        gfx.fillStyle( 0xE9F564,  0.2 ).fillCircle(x, y, 3);
        gfx.fillStyle( 0xEAFF00,  0.05 ).fillCircle(x, y, 2);
        gfx.fillStyle( 0xFFFFFF,  1).fillCircle(x, y, 1);
        }

        //Mid Asteroids
        for (let asteroid = 0; asteroid < midAsteroids; asteroid++) {

        let y = Phaser.Math.Between(0, scene.scale.height);
        let x = Phaser.Math.Between(0, scene.scale.width);

        gfx.fillStyle( 0xE9F564,  0.2 ).fillCircle(x, y, 4);
        gfx.fillStyle( 0xEAFF00,  0.05 ).fillCircle(x, y, 3);
        gfx.fillStyle( 0xFFFFFF,  1).fillCircle(x, y, 2);
        }

        //Large Asteroids
        for (let asteroid = 0; asteroid < maxAsteroids; asteroid++) {
        
        let y = Phaser.Math.Between(0, scene.scale.height);
        let x = Phaser.Math.Between(0, scene.scale.width);

        gfx.fillStyle( 0xE9F564,  0.2 ).fillCircle(x, y, 5);
        gfx.fillStyle( 0xEAFF00,  0.05 ).fillCircle(x, y, 4);
        gfx.fillStyle( 0xFFFFFF,  1).fillCircle(x, y, 3);
        }

        scene.events.on('shutdown', () => {
        gfx.destroy();
        });

    return gfx; //store the variable in case of future use
}