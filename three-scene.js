/* ============================================================
   THREE.JS COSMIC SCENE
   - Starfield (multi-layer parallax)
   - Nebula (gradient sprite layers)
   - Centerpiece icosahedron planet (wireframe + glow)
   - Orbit rings with traveling satellites
   - Floating low-poly shapes
   - Shooting stars
   - Mouse + scroll reactivity
   ============================================================ */

(function() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // -------- SCENE / CAMERA / RENDERER --------
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03000e, 0.0012);

    const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );
    camera.position.set(0, 0, 60);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // -------- COLORS --------
    const COLORS = {
        cyan: 0x00f5ff,
        magenta: 0xff00ff,
        purple: 0xa855f7,
        blue: 0x4f46e5,
        pink: 0xec4899,
        green: 0x00ff9d
    };

    // -------- CANVAS TEXTURE HELPERS --------
    function makeCircleTexture(color = '#ffffff', size = 64) {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        g.addColorStop(0, color);
        g.addColorStop(0.4, color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }

    function makeNebulaTexture(color1, color2, size = 512) {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        g.addColorStop(0, color1);
        g.addColorStop(0.5, color2);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    }

    // -------- STARFIELD (3 layers, parallax) --------
    const starfieldGroup = new THREE.Group();
    scene.add(starfieldGroup);

    function createStarLayer(count, size, range, color) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const c = new THREE.Color();
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * range;
            positions[i * 3 + 1] = (Math.random() - 0.5) * range;
            positions[i * 3 + 2] = (Math.random() - 0.5) * range;
            const palette = [COLORS.cyan, COLORS.magenta, COLORS.purple, 0xffffff, 0xffffff, 0xffffff];
            c.setHex(palette[Math.floor(Math.random() * palette.length)]);
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const material = new THREE.PointsMaterial({
            size: size,
            map: makeCircleTexture('#ffffff'),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            opacity: 0.9
        });
        return new THREE.Points(geometry, material);
    }

    const starsFar = createStarLayer(2500, 0.4, 800);
    const starsMid = createStarLayer(1200, 0.7, 500);
    const starsNear = createStarLayer(400, 1.2, 300);
    starfieldGroup.add(starsFar, starsMid, starsNear);

    // -------- NEBULA CLOUDS --------
    const nebulaGroup = new THREE.Group();
    scene.add(nebulaGroup);

    function createNebulaCloud(color1, color2, size, x, y, z) {
        const tex = makeNebulaTexture(color1, color2);
        const mat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(size, size, 1);
        sprite.position.set(x, y, z);
        return sprite;
    }

    nebulaGroup.add(createNebulaCloud('rgba(168,85,247,0.6)', 'rgba(168,85,247,0.1)', 200, -80, 30, -150));
    nebulaGroup.add(createNebulaCloud('rgba(255,0,255,0.5)', 'rgba(255,0,255,0.08)', 180, 100, -40, -180));
    nebulaGroup.add(createNebulaCloud('rgba(0,245,255,0.5)', 'rgba(0,245,255,0.08)', 220, 0, 60, -200));
    nebulaGroup.add(createNebulaCloud('rgba(79,70,229,0.5)', 'rgba(79,70,229,0.08)', 160, -120, -60, -160));
    nebulaGroup.add(createNebulaCloud('rgba(236,72,153,0.4)', 'rgba(236,72,153,0.08)', 140, 60, 80, -140));

    // -------- CENTERPIECE PLANET (icosahedron) --------
    const planetGroup = new THREE.Group();
    planetGroup.position.set(0, 0, 0);
    scene.add(planetGroup);

    const planetGeo = new THREE.IcosahedronGeometry(8, 1);
    const planetMat = new THREE.MeshBasicMaterial({
        color: COLORS.purple,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Inner solid glow sphere
    const innerGeo = new THREE.IcosahedronGeometry(6.5, 0);
    const innerMat = new THREE.MeshBasicMaterial({
        color: COLORS.magenta,
        transparent: true,
        opacity: 0.15,
        wireframe: true
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    planetGroup.add(inner);

    // Glow halo (sprite)
    const haloMat = new THREE.SpriteMaterial({
        map: makeNebulaTexture('rgba(168,85,247,0.8)', 'rgba(168,85,247,0)'),
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(40, 40, 1);
    planetGroup.add(halo);

    // Particle dust around planet
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 500;
    const dustPos = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    const tmpColor = new THREE.Color();
    for (let i = 0; i < dustCount; i++) {
        const r = 14 + Math.random() * 8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        dustPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        dustPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        dustPos[i * 3 + 2] = r * Math.cos(phi);
        const palette = [COLORS.cyan, COLORS.magenta, COLORS.purple];
        tmpColor.setHex(palette[Math.floor(Math.random() * palette.length)]);
        dustColors[i * 3] = tmpColor.r;
        dustColors[i * 3 + 1] = tmpColor.g;
        dustColors[i * 3 + 2] = tmpColor.b;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
    const dustMat = new THREE.PointsMaterial({
        size: 0.3,
        map: makeCircleTexture('#ffffff'),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        opacity: 0.9
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    planetGroup.add(dust);

    // -------- ORBIT RINGS WITH SATELLITES --------
    const orbitGroup = new THREE.Group();
    planetGroup.add(orbitGroup);

    function createOrbitRing(radius, color, tilt, rotZ) {
        const ringGroup = new THREE.Group();
        const ringGeo = new THREE.TorusGeometry(radius, 0.08, 4, 100);
        const ringMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.5
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ringGroup.add(ring);

        // Satellite that travels the ring
        const satGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const satMat = new THREE.MeshBasicMaterial({ color: color });
        const satellite = new THREE.Mesh(satGeo, satMat);
        satellite.position.set(radius, 0, 0);
        ringGroup.add(satellite);

        // Glow on satellite
        const satGlowMat = new THREE.SpriteMaterial({
            map: makeCircleTexture('#ffffff'),
            color: color,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const satGlow = new THREE.Sprite(satGlowMat);
        satGlow.scale.set(2.5, 2.5, 1);
        satellite.add(satGlow);

        ringGroup.rotation.x = tilt;
        ringGroup.rotation.z = rotZ;
        ringGroup.userData = { satellite, radius, speed: 0.5 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2 };
        return ringGroup;
    }

    const ring1 = createOrbitRing(14, COLORS.cyan, Math.PI / 2.5, 0);
    const ring2 = createOrbitRing(18, COLORS.magenta, Math.PI / 3, Math.PI / 4);
    const ring3 = createOrbitRing(22, COLORS.purple, Math.PI / 2, -Math.PI / 6);
    orbitGroup.add(ring1, ring2, ring3);

    // -------- FLOATING LOW-POLY SHAPES --------
    const shapesGroup = new THREE.Group();
    scene.add(shapesGroup);

    const shapeData = [
        { geo: new THREE.OctahedronGeometry(1.2, 0), color: COLORS.cyan, pos: [-30, 18, -30] },
        { geo: new THREE.TetrahedronGeometry(1.5, 0), color: COLORS.magenta, pos: [35, -15, -35] },
        { geo: new THREE.IcosahedronGeometry(1.0, 0), color: COLORS.purple, pos: [-40, -20, -50] },
        { geo: new THREE.OctahedronGeometry(1.4, 0), color: COLORS.pink, pos: [30, 22, -45] },
        { geo: new THREE.TetrahedronGeometry(1.1, 0), color: COLORS.green, pos: [-25, -28, -25] },
        { geo: new THREE.IcosahedronGeometry(1.3, 0), color: COLORS.blue, pos: [40, 8, -60] },
        { geo: new THREE.OctahedronGeometry(0.9, 0), color: COLORS.cyan, pos: [-50, 5, -70] },
        { geo: new THREE.TetrahedronGeometry(1.6, 0), color: COLORS.magenta, pos: [50, -25, -55] }
    ];

    const floatingShapes = [];
    shapeData.forEach(d => {
        const mat = new THREE.MeshBasicMaterial({
            color: d.color,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const mesh = new THREE.Mesh(d.geo, mat);
        mesh.position.set(...d.pos);
        mesh.userData = {
            speedX: (Math.random() - 0.5) * 0.005,
            speedY: (Math.random() - 0.5) * 0.005,
            speedZ: (Math.random() - 0.5) * 0.005,
            floatY: d.pos[1],
            floatPhase: Math.random() * Math.PI * 2,
            floatAmp: 2 + Math.random() * 3
        };
        shapesGroup.add(mesh);
        floatingShapes.push(mesh);
    });

    // -------- SHOOTING STARS --------
    const shootingStars = [];

    function createShootingStar() {
        const points = [];
        const startX = (Math.random() - 0.5) * 200;
        const startY = 50 + Math.random() * 30;
        const startZ = -50 - Math.random() * 50;
        for (let i = 0; i < 20; i++) {
            points.push(new THREE.Vector3(startX + i * 2, startY - i * 1.5, startZ));
        }
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        const colors = new Float32Array(20 * 3);
        for (let i = 0; i < 20; i++) {
            const a = i / 20;
            colors[i * 3] = a;
            colors[i * 3 + 1] = a * 0.8;
            colors[i * 3 + 2] = 1;
        }
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const mat = new THREE.LineBasicMaterial({
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        const line = new THREE.Line(geom, mat);
        line.userData = {
            life: 1,
            velocity: new THREE.Vector3(2 + Math.random(), -1.5 - Math.random(), 0)
        };
        scene.add(line);
        shootingStars.push(line);
    }

    setInterval(() => {
        if (shootingStars.length < 3 && Math.random() > 0.3) createShootingStar();
    }, 3500);

    // -------- INTERACTIVITY: MOUSE & SCROLL --------
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollY = 0;
    let scrollProgress = 0;

    window.addEventListener('mousemove', (e) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        scrollProgress = Math.min(scrollY / max, 1);
    }, { passive: true });

    // Touch support
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.tx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
            mouse.ty = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        }
    }, { passive: true });

    // -------- RESIZE --------
    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    // -------- ANIMATION LOOP --------
    const clock = new THREE.Clock();

    function animate() {
        const elapsed = clock.getElapsedTime();
        const delta = clock.getDelta();

        // Smooth mouse
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;

        // Camera parallax with mouse + scroll-based push
        camera.position.x = mouse.x * 5;
        camera.position.y = mouse.y * 3 + scrollY * 0.005;
        camera.position.z = 60 + scrollProgress * 30;
        camera.lookAt(0, scrollY * 0.005, 0);

        // Starfield rotation (multi-layer parallax)
        starsFar.rotation.y = elapsed * 0.005;
        starsFar.rotation.x = elapsed * 0.002;
        starsMid.rotation.y = elapsed * 0.01;
        starsMid.rotation.x = -elapsed * 0.003;
        starsNear.rotation.y = elapsed * 0.015;
        starsNear.rotation.x = elapsed * 0.005;

        // Nebula slow drift
        nebulaGroup.rotation.z = elapsed * 0.01;
        nebulaGroup.children.forEach((cloud, i) => {
            cloud.material.opacity = 0.25 + Math.sin(elapsed * 0.5 + i) * 0.1;
        });

        // Planet rotation
        planet.rotation.x = elapsed * 0.15;
        planet.rotation.y = elapsed * 0.2;
        inner.rotation.x = -elapsed * 0.1;
        inner.rotation.y = -elapsed * 0.18;

        // Halo pulse
        halo.scale.x = halo.scale.y = 40 + Math.sin(elapsed * 1.5) * 4;

        // Dust slow swirl
        dust.rotation.y = elapsed * 0.05;
        dust.rotation.x = elapsed * 0.03;

        // Planet group reacts to scroll - drift offscreen as user scrolls
        planetGroup.position.x = -scrollProgress * 35;
        planetGroup.position.y = scrollProgress * 15;
        planetGroup.scale.setScalar(1 - scrollProgress * 0.3);

        // Orbit satellites travel
        [ring1, ring2, ring3].forEach((ringGroup) => {
            const data = ringGroup.userData;
            const angle = elapsed * data.speed + data.phase;
            data.satellite.position.x = Math.cos(angle) * data.radius;
            data.satellite.position.z = Math.sin(angle) * data.radius;
        });
        orbitGroup.rotation.y = elapsed * 0.05;

        // Floating shapes
        floatingShapes.forEach((shape) => {
            const d = shape.userData;
            shape.rotation.x += d.speedX * 60 * delta;
            shape.rotation.y += d.speedY * 60 * delta;
            shape.rotation.z += d.speedZ * 60 * delta;
            shape.position.y = d.floatY + Math.sin(elapsed * 0.5 + d.floatPhase) * d.floatAmp;
        });
        shapesGroup.rotation.y = elapsed * 0.01;

        // Shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const star = shootingStars[i];
            star.position.add(star.userData.velocity);
            star.userData.life -= 0.012;
            star.material.opacity = star.userData.life;
            if (star.userData.life <= 0) {
                scene.remove(star);
                star.geometry.dispose();
                star.material.dispose();
                shootingStars.splice(i, 1);
            }
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

    // Expose for debugging if needed
    window.__threeScene = { scene, camera, renderer };
})();
