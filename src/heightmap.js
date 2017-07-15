const Heightmap = {
	seed: null,

	random() {
		this.seed = (this.seed * 9301 + 49297) % 233280;
		return this.seed / 233280;
	},

	displace(d) {
		return (this.random() - 0.5) * d;
	},

	clamp(n) {
		return Math.min(1, Math.max(0, n));
	},

	create(iterations, roughness, seed) {
		this.seed = !isNaN(Number(seed)) ? Number(seed) : Math.random();

		const size = Math.pow(2, iterations) + 1;
		const ubound = size - 1;
		const map = [];

		let y = size;
		while(y--) {
			let x = size;
			map[y] = [];
			while(x--) {
				map[y][x] = null;
			}
		}

		map[0][0] = this.random();
		map[0][ubound] = this.random();
		map[ubound][0] = this.random();
		map[ubound][ubound] = this.random();

		let frac = ubound;
		let range = 1;

		while(frac > 1) {

			for(let y = 0; y < ubound; y += frac) {
				for(let x = 0; x < ubound; x += frac) {
					const a = map[y][x];
					const b = map[y][x + frac];
					const c = map[y + frac][x];
					const d = map[y + frac][x + frac];

					map[y + (frac / 2)][x + (frac / 2)] = this.clamp(((a + b + c + d) / 4) + this.displace(range));
				}
			}

			for(let y = 0; y < ubound; y += frac) {
				for(let x = 0; x < ubound; x += frac) {
					const a = map[y][x];
					const b = map[y][x + frac];
					const c = map[y + frac][x];
					const d = map[y + frac][x + frac];
					const e = map[y + (frac / 2)][x + (frac / 2)];

					map[y][x + (frac / 2)] = this.clamp((y ? (map[y - (frac / 2)][x] + b + e + a) / 4  : (b + e + a) / 3) + this.displace(range));
					map[y + (frac / 2)][x + frac] = this.clamp((x + frac < ubound ? (b + map[y + (frac / 2)][x + (frac * 1.5)] + d + e) / 4 : (b + d + e) / 3) + this.displace(range));
					map[y + frac][x + (frac / 2)] = this.clamp((y + frac < ubound ? (e + d + map[y + (frac * 1.5)][x + (frac / 2)] + c) / 4 : (e + d + c) / 3) + this.displace(range));
					map[y + (frac / 2)][x] = this.clamp((x ? (a + e + c + map[y + (frac / 2)][x - (frac / 2)]) / 4 : (a + e + c) / 3 ) + this.displace(range));
				}
			}

			frac /= 2;
			range *= roughness;
		}
		
		return map;
	},

	draw(canvas, heightmap, tileSize = 1) {
		if(typeof canvas === "string")
			canvas = document.getElementById(canvas);

		if(!(canvas instanceof HTMLCanvasElement))
			return null;

		const screen = canvas.getContext("2d");

		canvas.width = heightmap.length * tileSize;
		canvas.height = heightmap.length * tileSize;

		let y = heightmap.length;
		while(y--) {
			let x = heightmap.length;
			while(x--) {
				const lum = Math.floor(heightmap[y][x] * 255);
				screen.fillStyle = "rgb(" + lum + ", " + lum + ", " + lum + ")";
				screen.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
			}
		}
	}
};
