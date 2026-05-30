(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const hud = {
    shell: document.querySelector(".game-shell"),
    time: document.getElementById("hudTime"),
    phase: document.getElementById("hudPhase"),
    pressure: document.getElementById("hudPressure"),
    served: document.getElementById("hudServed"),
    customers: document.getElementById("hudCustomers"),
    queue: document.getElementById("hudQueue"),
    task: document.getElementById("hudTask"),
    resume: document.getElementById("hudResume"),
    cashLabel: document.getElementById("cashLabel"),
    cashMeter: document.getElementById("cashMeter"),
    bodyLabel: document.getElementById("bodyLabel"),
    bodyMeter: document.getElementById("bodyMeter"),
    cleanLabel: document.getElementById("cleanLabel"),
    cleanMeter: document.getElementById("cleanMeter"),
    eventLog: document.getElementById("eventLog"),
  };

  const TILE = 16;
  const WORLD = { w: 64 * TILE, h: 40 * TILE };
  const rand = (min, max) => Math.random() * (max - min) + min;
  const randi = (min, max) => Math.floor(rand(min, max + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const colors = {
    floor: "#e8dbc2",
    tileA: "#efe5cf",
    tileB: "#e5d4b8",
    wall: "#4e332b",
    counter: "#80553e",
    counterTop: "#b08357",
    backroom: "#9a9286",
    kitchen: "#b8b0a0",
    glass: "#6fc1d4",
    door: "#2a8850",
    red: "#d3362d",
    khaki: "#c6a85f",
    greenRobot: "#2bc84d",
    customer: ["#4aa3ff", "#ffd84a", "#da6aff", "#ff8a3d", "#79e0b1", "#e9e3d0"],
    mess: "#4b7f2f",
    shadow: "rgba(0,0,0,.28)",
    label: "#1a120e",
  };

  const zones = {
    entrance_front_left: { name: "Front Left", x: 250, y: 34 },
    entrance_front_right: { name: "Front Right", x: 760, y: 34 },
    entrance_west: { name: "West Door", x: 42, y: 195 },
    entrance_east: { name: "East Door", x: 982, y: 195 },
    clock_wall: { name: "Digital Clock", x: 512, y: 38 },
    register_1: { name: "Register 1", x: 405, y: 345 },
    register_2: { name: "Register 2", x: 512, y: 345 },
    register_3: { name: "Register 3", x: 620, y: 345 },
    behind_registers: { name: "Checkstand", x: 512, y: 400 },
    fountain: { name: "Fountain", x: 160, y: 145 },
    lady_lair: { name: "Lady's Lair", x: 110, y: 245 },
    mens_bathroom: { name: "Men's", x: 165, y: 280 },
    grill: { name: "Grill", x: 176, y: 374 },
    cooler_sales: { name: "Energy/Soda", x: 174, y: 470 },
    coffee: { name: "Coffee", x: 850, y: 145 },
    womens_bathroom: { name: "Women's", x: 848, y: 280 },
    grocery: { name: "Grocery/Beer", x: 842, y: 410 },
    chips: { name: "Chips", x: 330, y: 190 },
    candy: { name: "Candy", x: 684, y: 205 },
    pastry: { name: "Doughnuts", x: 675, y: 300 },
    automotive: { name: "Auto", x: 337, y: 300 },
    kitchen: { name: "Kitchen", x: 512, y: 505 },
    food_cooler: { name: "Food Cooler", x: 228, y: 588 },
    sink_area: { name: "Sink", x: 512, y: 588 },
    bib_room: { name: "BIB", x: 720, y: 588 },
    drink_cooler_back: { name: "Drink Cooler", x: 842, y: 588 },
    back_door: { name: "Back Door", x: 512, y: 625 },
    parking_lot_marker: { name: "Pumps Camera", x: 512, y: 92 },
  };

  const entrances = [
    zones.entrance_front_left,
    zones.entrance_front_right,
    zones.entrance_west,
    zones.entrance_east,
  ];

  const shoppingZones = [
    zones.cooler_sales,
    zones.coffee,
    zones.grill,
    zones.chips,
    zones.candy,
    zones.pastry,
    zones.grocery,
    zones.fountain,
    zones.automotive,
  ];

  const phases = [
    {
      id: "walk_judgement",
      name: "Walk of Judgement",
      from: 0,
      to: 60,
      tasks: [
        ["clock in", zones.behind_registers, "tap"],
        ["attach silent alarm near left ass cheek", zones.behind_registers, "tap"],
        ["obtain broom from Lady Scrubberton's lair", zones.lady_lair, "carry"],
        ["check cooler and pastry dates", zones.pastry, "inspect"],
        ["fill fountain cups, lids, straws, napkins", zones.fountain, "stock"],
        ["clean men's bathroom", zones.mens_bathroom, "mop"],
        ["wipe grill area and power down warmer", zones.grill, "wipe"],
        ["stage coffee and tea supplies", zones.coffee, "stock"],
        ["count registers and drop cash to standard", zones.behind_registers, "cash"],
      ],
    },
    {
      id: "deep_clean",
      name: "Deep Clean",
      from: 60,
      to: 150,
      tasks: [
        ["borrow trash bin from kitchen", zones.kitchen, "carry"],
        ["break down roller grills", zones.grill, "wipe"],
        ["write off wizard fingers", zones.grill, "toss"],
        ["scrub grills with ice water", zones.grill, "scrub"],
        ["brew tea without flooding the store", zones.coffee, "brew"],
        ["fill coffee cups and wipe counters", zones.coffee, "stock"],
        ["stock mini coolers", zones.cooler_sales, "stock"],
      ],
    },
    {
      id: "unboxening",
      name: "The Unboxening",
      from: 150,
      to: 300,
      tasks: [
        ["receive delivery through back door", zones.back_door, "carry"],
        ["move carts of holding into kitchen", zones.kitchen, "cart"],
        ["uncrate food cooler products", zones.kitchen, "unbox"],
        ["stock sales floor products", zones.fountain, "stock"],
        ["stock food cooler products", zones.food_cooler, "stock"],
        ["hide cigarette and pouch crates until 0500", zones.back_door, "stash"],
        ["stock chips on annoying pegs", zones.chips, "stock"],
        ["stock automotive and little cakes", zones.automotive, "stock"],
        ["stock candy, cookies, nuts, and grocery", zones.candy, "stock"],
        ["tie second trash bag and move to backroom", zones.sink_area, "carry"],
      ],
    },
    {
      id: "kitchen_power_hour",
      name: "Kitchen Power Hour",
      from: 300,
      to: 360,
      food: true,
      tasks: [
        ["gloves on, hat on", zones.kitchen, "glove"],
        ["scrape fryer filter drawer", zones.kitchen, "scrub"],
        ["press exactly 21 kitchen buttons", zones.kitchen, "buttons"],
        ["move fresh grill items down", zones.grill, "stock"],
        ["prep breakfast sandwiches by 0325", zones.kitchen, "prep"],
        ["cook yellow, grey, blue, and jalapeno trays", zones.kitchen, "cook"],
        ["reboot PCs and registers in correct order", zones.behind_registers, "tap"],
        ["stock doughnut cage if not done", zones.pastry, "stock"],
        ["sticker sandwiches and load warmer", zones.grill, "stock"],
        ["unglove and remove hat", zones.kitchen, "glove"],
      ],
    },
    {
      id: "walk_reflection",
      name: "Walk of Reflection",
      from: 360,
      to: 420,
      tasks: [
        ["mop sales floor edges", zones.fountain, "mop"],
        ["mop men's bathroom", zones.mens_bathroom, "mop"],
        ["wipe all counters", zones.coffee, "wipe"],
        ["clean roller grill glass", zones.grill, "wipe"],
        ["clean cooler glass", zones.cooler_sales, "wipe"],
        ["clean doughnut cage glass", zones.pastry, "wipe"],
        ["face coolers", zones.cooler_sales, "stock"],
        ["judge all counters with antibac towel", zones.behind_registers, "wipe"],
      ],
    },
    {
      id: "morning_hoard",
      name: "Defeat the Morning Hoard",
      from: 420,
      to: 540,
      tasks: [
        ["take position behind register 2", zones.register_2, "tap"],
        ["run register for daywalkers", zones.register_2, "scan"],
        ["stock cigarettes", zones.behind_registers, "stock"],
        ["stock nicotine pouches", zones.behind_registers, "stock"],
        ["offer to take out trash", zones.back_door, "carry"],
        ["clock out and charge silent alarm", zones.behind_registers, "tap"],
      ],
    },
  ];

  const customerNames = [
    "Brenda",
    "Mason",
    "Tasha",
    "Dale",
    "Kiara",
    "Earl",
    "Nia",
    "Trent",
    "Big Mike",
    "Energy Drink Greg",
    "Lottery Linda",
    "Hoodie Kid",
    "Officer Ramirez",
    "Firefighter Jo",
    "Coleslaw Mike",
    "Nitro Beth",
    "Pump Four Carl",
    "Taquito Ron",
    "Exact Change Stan",
    "No Receipt Tina",
  ];

  const behindRequests = [
    "Two Marlboro Lights. No bag.",
    "Can I get pump 4?",
    "Zyn wintergreen.",
    "Black & Mild.",
    "Lotto, but explained badly.",
    "No receipt.",
    "You already know.",
  ];

  const state = {
    started: false,
    overrideTime: new URLSearchParams(location.search).get("time") || "02:47",
    nowMinutes: 0,
    phase: phases[0],
    phaseTaskIndex: 0,
    currentTask: null,
    taskTimer: 0,
    taskDuration: 4,
    resumeLabel: "None",
    eventLog: [],
    customers: [],
    messes: [],
    employees: [],
    bubbles: [],
    customerSpawnTimer: 1,
    served: 0,
    cash: 18,
    body: 45,
    clean: 100,
    checkout: null,
    safeDropTimer: 0,
    camera: { x: 0, y: 0 },
    debug: { fps: 0, frameMs: 0, frames: 0, lastFps: performance.now() },
    muted: false,
    audioStarted: false,
    lastPhaseId: "",
    deliverySpawned: false,
    coworkersSpawned: false,
    robotSpawned0100: false,
    robotSpawned0500: false,
    simulatedOffsetMs: 0,
  };

  const adam = {
    kind: "adam",
    name: "Adam",
    x: zones.behind_registers.x,
    y: zones.behind_registers.y,
    target: zones.behind_registers,
    speed: 72,
    mode: "normal",
    anim: "idle",
    bubble: "",
    bubbleTime: 0,
  };

  let audioCtx = null;
  let musicTimer = null;

  function addEvent(text) {
    state.eventLog.unshift(text);
    state.eventLog = state.eventLog.slice(0, 5);
    for (const [i, item] of [...hud.eventLog.children].entries()) {
      item.textContent = state.eventLog[i] || "";
    }
    while (hud.eventLog.children.length < 3) {
      hud.eventLog.appendChild(document.createElement("li"));
    }
  }

  function bubble(entity, text, seconds = 2.4) {
    entity.bubble = text;
    entity.bubbleTime = seconds;
    state.bubbles.push({ entity, text, ttl: seconds });
  }

  function formatTime(minutes) {
    const total = minutes < 120 ? 22 * 60 + minutes : minutes - 120;
    const h = Math.floor(total / 60) % 24;
    const m = Math.floor(total % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function parseClockToShiftMinutes(value) {
    if (!value || value === "real") {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      })
        .formatToParts(new Date(Date.now() + state.simulatedOffsetMs))
        .reduce((acc, part) => {
          acc[part.type] = part.value;
          return acc;
        }, {});
      const h = Number(parts.hour);
      const m = Number(parts.minute) + Number(parts.second || 0) / 60;
      if (h >= 22) return (h - 22) * 60 + m;
      if (h < 7) return (h + 2) * 60 + m;
      return -1;
    }
    const [hRaw, mRaw] = value.split(":").map(Number);
    if (hRaw >= 22) return (hRaw - 22) * 60 + mRaw;
    return (hRaw + 2) * 60 + mRaw;
  }

  function phaseForMinute(minute) {
    if (minute < 0 || minute > 540) return { id: "off_shift", name: "Off Shift", from: 0, to: 0, tasks: [["waiting for night shift", zones.register_2, "idle"]] };
    return phases.find((p) => minute >= p.from && minute < p.to) || phases[phases.length - 1];
  }

  function setPhaseFromClock() {
    state.nowMinutes = parseClockToShiftMinutes(state.overrideTime);
    const phase = phaseForMinute(state.nowMinutes);
    if (phase.id !== state.lastPhaseId) {
      state.phase = phase;
      state.lastPhaseId = phase.id;
      const progress = phase.to > phase.from ? (state.nowMinutes - phase.from) / (phase.to - phase.from) : 0;
      state.phaseTaskIndex = clamp(Math.floor(progress * phase.tasks.length), 0, phase.tasks.length - 1);
      setTaskFromIndex();
      if (phase.id === "morning_hoard") {
        state.messes = [];
        state.clean = 100;
        state.cash = Math.min(45, state.cash);
        state.safeDropTimer = 0;
        state.resumeLabel = "None";
        adam.x = zones.register_2.x;
        adam.y = zones.register_2.y;
        adam.target = zones.register_2;
      }
      addEvent(`${phase.name} begins`);
      if (phase.food) bubble(adam, "Gloves on. Hat on. Joy absent.", 3);
    }
  }

  function setTaskFromIndex() {
    const t = state.phase.tasks[state.phaseTaskIndex] || state.phase.tasks[0];
    state.currentTask = { label: t[0], zone: t[1], anim: t[2] };
    adam.target = t[1];
    adam.anim = t[2];
    state.taskTimer = 0;
    const phaseSpan = Math.max(1, state.phase.to - state.phase.from);
    state.taskDuration = clamp((phaseSpan * 60) / state.phase.tasks.length / 24, 3.5, 13);
  }

  function speedMultiplier() {
    const phase = state.phase;
    const expected = phase.to > phase.from ? (state.nowMinutes - phase.from) / (phase.to - phase.from) : 0;
    const actual = (state.phaseTaskIndex + state.taskTimer / state.taskDuration) / Math.max(1, phase.tasks.length);
    const pressure = expected - actual;
    const pressureBoost = pressure > 0.18 ? 1.35 : pressure > 0.08 ? 1.18 : pressure < -0.12 ? 0.82 : 1;
    const bodyBoost = state.body > 85 ? 1.25 : state.body > 60 ? 1.12 : 1;
    return pressureBoost * bodyBoost;
  }

  function pressureLabel() {
    const phase = state.phase;
    const expected = phase.to > phase.from ? (state.nowMinutes - phase.from) / (phase.to - phase.from) : 0;
    const actual = (state.phaseTaskIndex + state.taskTimer / state.taskDuration) / Math.max(1, phase.tasks.length);
    const pressure = expected - actual;
    if (pressure > 0.25) return "Method Is Screaming";
    if (pressure > 0.1) return "Behind Method";
    if (pressure < -0.14) return "Ahead of Method";
    return "On Method";
  }

  function moveToward(entity, target, dt, speed = entity.speed || 60) {
    const dx = target.x - entity.x;
    const dy = target.y - entity.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) return true;
    const step = Math.min(d, speed * dt);
    entity.x += (dx / d) * step;
    entity.y += (dy / d) * step;
    return d < 4;
  }

  function spawnCustomer() {
    const entrance = pick(entrances);
    const target = pick(shoppingZones);
    const activeNames = new Set(state.customers.map((c) => c.name));
    const availableNames = customerNames.filter((name) => !activeNames.has(name));
    const name = pick(availableNames.length ? availableNames : customerNames);
    const archetypeRoll = Math.random();
    const regular = Math.random() < 0.33;
    const cashFondler = archetypeRoll < 0.25;
    const messy = !cashFondler && archetypeRoll < 0.4;
    const thief = archetypeRoll > 0.95;
    const requester = regular || Math.random() < 0.18;
    const responder = name.includes("Officer") || name.includes("Firefighter") || Math.random() < 0.025;
    const customer = {
      kind: "customer",
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name,
      x: entrance.x,
      y: entrance.y,
      entrance,
      target,
      color: pick(colors.customer),
      speed: rand(34, 55),
      state: "shopping",
      wait: rand(1.5, 5.2),
      items: randi(1, 6),
      regular,
      cashFondler,
      messy,
      thief,
      requester,
      responder,
      bubble: "",
      bubbleTime: 0,
      greeted: false,
    };
    state.customers.push(customer);
    bubble(adam, "welcome in", 1.4);
    if (state.audioStarted) playSfx("door");
    addEvent(`${name} entered via ${entrance.name}`);
  }

  function spawnMess(x, y, major = false) {
    state.messes.push({ x, y, major, ttl: major ? 999 : 90, label: major ? "CODE BROWN" : "tiny mess" });
    state.clean = clamp(state.clean - (major ? 12 : 2), 0, 100);
    addEvent(major ? "Major mess spawned. Humanity failed." : "Tiny mess spotted.");
    if (state.audioStarted) playSfx("mess");
  }

  function spawnRobot() {
    const existing = state.employees.find((e) => e.kind === "lady_scrubberton");
    if (existing) {
      existing.x = zones.lady_lair.x;
      existing.y = zones.lady_lair.y;
      existing.target = zones.fountain;
      existing.idx = 0;
      bubble(existing, "Back out again. Naturally.", 3);
      addEvent("Green Lady Scrubberton redeployed.");
      if (state.audioStarted) playSfx("robot");
      return;
    }
    const robot = {
      kind: "lady_scrubberton",
      name: "Lady Scrubberton",
      x: zones.lady_lair.x,
      y: zones.lady_lair.y,
      target: zones.fountain,
      speed: 45,
      route: [zones.fountain, zones.coffee, zones.grill, zones.cooler_sales, zones.lady_lair],
      idx: 0,
      bubble: "",
      bubbleTime: 0,
    };
    state.employees.push(robot);
    bubble(robot, "Cleaning what humans have done.", 3);
    addEvent("Green Lady Scrubberton deployed.");
    if (state.audioStarted) playSfx("robot");
  }

  function spawnCoworkers() {
    const manager = { kind: "employee", name: "Manager", x: zones.back_door.x - 20, y: zones.back_door.y, target: zones.kitchen, speed: 58, shorts: false, bubble: "", bubbleTime: 0 };
    const clerk = { kind: "employee", name: "Clerk", x: zones.back_door.x + 20, y: zones.back_door.y, target: zones.grocery, speed: 55, shorts: true, bubble: "", bubbleTime: 0 };
    state.employees.push(manager, clerk);
    bubble(manager, "Morning crew clocked in.", 3);
    addEvent("Other manager and clerk entered through the back door.");
  }

  function updateCustomers(dt) {
    const rate = state.phase.id === "morning_hoard" ? rand(1.2, 2.8) : state.phase.id === "kitchen_power_hour" ? rand(5.5, 9) : rand(3.6, 7.5);
    state.customerSpawnTimer -= dt;
    if (state.customerSpawnTimer <= 0 && state.customers.length < 16) {
      spawnCustomer();
      state.customerSpawnTimer = rate;
    }

    for (const c of state.customers) {
      if (c.bubbleTime > 0) c.bubbleTime -= dt;
      if (c.state === "shopping") {
        if (moveToward(c, c.target, dt, c.speed)) {
          c.state = "loiter";
          c.wait = rand(1.4, 4.6);
          if (c.requester && Math.random() < 0.45) bubble(c, pick(behindRequests), 2.6);
        }
      } else if (c.state === "loiter") {
        c.wait -= dt;
        if (c.wait <= 0) {
          if (c.messy && Math.random() < 0.35) spawnMess(c.x + rand(-12, 12), c.y + rand(-12, 12), Math.random() < 0.08);
          if (c.thief && Math.random() < 0.28) {
            c.state = "leaving";
            c.target = c.entrance;
            bubble(adam, "I see you, dipshit.", 2);
            addEvent(`${c.name} looked shady. Note the time.`);
          } else {
            c.state = "queue";
            c.target = { x: zones.register_2.x + rand(-28, 28), y: zones.register_2.y - 42 - state.customers.filter((x) => x.state === "queue").length * 18 };
            if (c.requester) bubble(c, pick(behindRequests), 3.8);
          }
        }
      } else if (c.state === "queue") {
        moveToward(c, c.target, dt, c.speed);
      } else if (c.state === "leaving") {
        if (moveToward(c, c.target, dt, c.speed + 8)) c.done = true;
      }
    }
    state.customers = state.customers.filter((c) => !c.done);
  }

  function updateAdam(dt) {
    adam.mode = state.phase.food ? "food" : "normal";
    const queue = state.customers.filter((c) => c.state === "queue");

    if (!state.checkout && state.safeDropTimer <= 0 && queue.length > 0) {
      const customer = queue[0];
      state.resumeLabel = state.currentTask ? state.currentTask.label : "None";
      state.checkout = {
        customer,
        timer: customer.cashFondler ? rand(3.4, 6.4) : rand(1.8, 3.2),
        phase: "walk",
      };
      adam.target = zones.register_2;
      adam.anim = "scan";
      bubble(adam, state.nowMinutes >= 300 ? "good morning" : "good evening", 1.5);
    }

    if (state.checkout) {
      if (moveToward(adam, zones.register_2, dt, 110 * speedMultiplier())) {
        state.checkout.timer -= dt;
        if (state.checkout.timer > 0 && Math.random() < dt * 2) {
          if (state.audioStarted) playSfx("scan");
        }
        if (state.checkout.timer <= 0) completeCheckout(state.checkout.customer);
      }
      return;
    }

    if (state.safeDropTimer > 0) {
      adam.target = zones.behind_registers;
      if (moveToward(adam, zones.behind_registers, dt, 100)) {
        state.safeDropTimer -= dt;
        if (state.safeDropTimer <= 0) {
          state.cash = Math.min(45, state.cash);
          addEvent("Safe drop complete. Register cash <= $75.");
          if (state.audioStarted) playSfx("safe");
        }
      }
      return;
    }

    const mess = state.messes.find((m) => Math.hypot(m.x - adam.x, m.y - adam.y) < 54 || m.major);
    if (mess && state.customers.filter((c) => c.state === "queue").length === 0 && Math.random() < dt * 0.9) {
      adam.target = mess;
      adam.anim = "mop";
      if (moveToward(adam, mess, dt, 90 * speedMultiplier())) {
        mess.cleaned = true;
        state.clean = clamp(state.clean + (mess.major ? 10 : 2), 0, 100);
        addEvent(mess.major ? "Cleaned a catastrophic mess." : "Cleaned a tiny mess.");
      }
      state.messes = state.messes.filter((m) => !m.cleaned);
      return;
    }

    if (!state.currentTask) setTaskFromIndex();
    if (state.phase.id === "morning_hoard") adam.target = zones.register_2;
    if (moveToward(adam, adam.target, dt, adam.speed * speedMultiplier())) {
      state.taskTimer += dt;
      if (state.taskTimer >= state.taskDuration) {
        state.phaseTaskIndex = (state.phaseTaskIndex + 1) % state.phase.tasks.length;
        setTaskFromIndex();
      }
    }
  }

  function completeCheckout(customer) {
    customer.state = "leaving";
    customer.target = customer.entrance;
    const cashAmount = customer.cashFondler ? randi(8, 92) : 0;
    if (customer.cashFondler) {
      addEvent(`${customer.name} cash-fondled $${cashAmount}.`);
      const retained = Math.min(cashAmount, Math.max(0, 75 - state.cash));
      state.cash = Math.min(75, state.cash + retained);
      const deposited = cashAmount - retained;
      if (deposited > 0) addEvent(`Deposited $${deposited} immediately. Register never exceeds $75.`);
      bubble(adam, "No eye rolling. No eye rolling.", 2.2);
      if (state.audioStarted) playSfx("cash");
    } else if (customer.responder) {
      addEvent(`${customer.name} got a free drink.`);
    } else {
      addEvent(`${customer.name} paid with a card.`);
    }
    if (customer.items > 3) bubble(adam, "Bagging the stimulants.", 1.5);
    bubble(customer, "thanks", 1.2);
    state.served++;
    if (state.cash >= 75) {
      state.safeDropTimer = 1.6;
      addEvent("Cash at $75. Immediate safe drop.");
    }
    state.checkout = null;
    state.resumeLabel = "None";
    if (state.currentTask) adam.target = state.currentTask.zone;
  }

  function updateEmployees(dt) {
    const m = state.nowMinutes;
    if (m >= 180 && !state.robotSpawned0100) {
      state.robotSpawned0100 = true;
      spawnRobot();
    }
    if (m >= 420 && !state.robotSpawned0500) {
      state.robotSpawned0500 = true;
      spawnRobot();
    }
    if (m >= 420 && !state.coworkersSpawned) {
      state.coworkersSpawned = true;
      spawnCoworkers();
    }
    if (m >= 150 && !state.deliverySpawned) {
      state.deliverySpawned = true;
      addEvent("Delivery crates arrived through the back door.");
    }

    for (const e of state.employees) {
      if (e.bubbleTime > 0) e.bubbleTime -= dt;
      if (moveToward(e, e.target, dt, e.speed || 45)) {
        if (e.kind === "lady_scrubberton") {
          e.idx = (e.idx + 1) % e.route.length;
          e.target = e.route[e.idx];
          if (Math.random() < 0.2) bubble(e, pick(["Human liquids detected.", "Floor morale: low.", "You missed a spot."]), 2.6);
        } else {
          e.target = pick([zones.kitchen, zones.grocery, zones.coffee, zones.grill, zones.behind_registers]);
        }
      }
    }
  }

  function updateMeters(dt) {
    state.body = clamp(state.body + dt * (state.phase.id === "kitchen_power_hour" ? 0.9 : 0.55), 0, 100);
    state.clean = clamp(state.clean - dt * state.messes.length * 0.04, 0, 100);
    if (state.body > 92 && Math.random() < dt * 0.25) bubble(adam, "Nitro cold brew was a mistake.", 2);
    if (state.cash > 75 && state.safeDropTimer <= 0) state.safeDropTimer = 1.2;
  }

  function update(dt) {
    setPhaseFromClock();
    updateCustomers(dt);
    updateAdam(dt);
    updateEmployees(dt);
    updateMeters(dt);
    for (const b of state.bubbles) b.ttl -= dt;
    state.bubbles = state.bubbles.filter((b) => b.ttl > 0);
    updateCamera();
    updateHud();
  }

  function updateCamera() {
    const view = viewportSize();
    const viewW = Math.min(view.w, WORLD.w);
    const viewH = Math.min(view.h, WORLD.h);
    state.camera.x += (adam.x - viewW / 2 - state.camera.x) * 0.08;
    state.camera.y += (adam.y - viewH / 2 - state.camera.y) * 0.08;
    state.camera.x = clamp(state.camera.x, 0, Math.max(0, WORLD.w - viewW));
    state.camera.y = clamp(state.camera.y, 0, Math.max(0, WORLD.h - viewH));
  }

  function pixelRatio() {
    return Math.min(window.devicePixelRatio || 1, 2);
  }

  function viewportSize() {
    return { w: canvas.width / pixelRatio(), h: canvas.height / pixelRatio() };
  }

  function worldOffset() {
    const view = viewportSize();
    return {
      x: Math.max(0, (view.w - WORLD.w) / 2),
      y: Math.max(0, (view.h - WORLD.h) / 2),
    };
  }

  function resize() {
    const pr = pixelRatio();
    canvas.width = Math.floor(window.innerWidth * pr);
    canvas.height = Math.floor(window.innerHeight * pr);
    ctx.imageSmoothingEnabled = false;
  }

  function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function screen(x, y) {
    const offset = worldOffset();
    return {
      x: (x - state.camera.x + offset.x) * pixelRatio(),
      y: (y - state.camera.y + offset.y) * pixelRatio(),
    };
  }

  function drawWorldText(text, x, y, color = colors.label, size = 9, align = "center") {
    const p = screen(x, y);
    ctx.save();
    ctx.scale(pixelRatio(), pixelRatio());
    ctx.font = `700 ${size}px Pixelify Sans, monospace`;
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.fillText(text, Math.round(p.x / pixelRatio()), Math.round(p.y / pixelRatio()));
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(pixelRatio(), pixelRatio());
    const offset = worldOffset();
    ctx.translate(Math.round(offset.x - state.camera.x), Math.round(offset.y - state.camera.y));
    drawMap();
    for (const m of state.messes) drawMess(m);
    drawEntity(adam);
    for (const c of state.customers) drawEntity(c);
    for (const e of state.employees) drawEntity(e);
    ctx.restore();
    drawBubbles();
  }

  function drawMap() {
    drawRect(0, 0, WORLD.w, WORLD.h, colors.wall);
    drawRect(32, 32, WORLD.w - 64, WORLD.h - 48, colors.floor);
    for (let y = 32; y < WORLD.h - 48; y += TILE) {
      for (let x = 32; x < WORLD.w - 64; x += TILE) {
        drawRect(x, y, TILE, TILE, ((x + y) / TILE) % 2 === 0 ? colors.tileA : colors.tileB);
      }
    }
    drawRect(32, 488, WORLD.w - 64, 120, colors.backroom);
    drawRect(240, 438, 544, 96, colors.kitchen);
    drawRect(350, 326, 330, 40, colors.counter);
    drawRect(375, 302, 70, 52, colors.counterTop);
    drawRect(477, 302, 70, 52, colors.counterTop);
    drawRect(580, 302, 70, 52, colors.counterTop);
    drawRect(80, 112, 160, 62, colors.glass);
    drawRect(772, 112, 170, 62, colors.counterTop);
    drawRect(80, 340, 190, 52, colors.counterTop);
    drawRect(72, 430, 210, 44, colors.glass);
    drawRect(752, 380, 205, 88, colors.glass);
    drawRect(285, 154, 140, 46, "#d9b85b");
    drawRect(606, 170, 150, 46, "#e1869c");
    drawRect(300, 272, 150, 40, "#9b9c73");
    drawRect(610, 274, 150, 48, "#d2a15d");
    drawRect(96, 220, 112, 78, "#c6c0b0");
    drawRect(790, 230, 116, 80, "#c6c0b0");
    drawDoors();
    drawLabels();
    drawWorldText(formatTime(Math.max(0, state.nowMinutes)), zones.clock_wall.x, zones.clock_wall.y + 18, "#ffd84a", 14);
    if (state.deliverySpawned) {
      for (let i = 0; i < 10; i++) drawRect(430 + i * 18, 575 + (i % 2) * 14, 14, 12, i % 2 ? "#fff1d1" : "#ff9a3c");
    }
  }

  function drawDoors() {
    for (const e of entrances) {
      drawRect(e.x - 24, e.y - 8, 48, 14, colors.door);
    }
    drawRect(zones.back_door.x - 30, zones.back_door.y - 10, 60, 14, "#2a4f88");
  }

  function drawLabels() {
    const labels = [
      [zones.clock_wall, "SNACKS & STIMULANTS"],
    ];
    for (const [z, label] of labels) drawWorldText(label, z.x, z.y - 20, colors.label, 10);
  }

  function drawEntity(e) {
    if (e.kind === "adam") return drawAdam(e);
    if (e.kind === "customer") return drawCustomer(e);
    if (e.kind === "lady_scrubberton") return drawRobot(e);
    drawEmployee(e);
  }

  function drawAdam(e) {
    drawRect(e.x - 7, e.y + 9, 15, 4, colors.shadow);
    drawRect(e.x - 5, e.y - 13, 10, 8, "#f0bd8d");
    drawRect(e.x - 7, e.y - 5, 14, 15, colors.red);
    drawRect(e.x - 7, e.y + 10, 6, 12, colors.khaki);
    drawRect(e.x + 1, e.y + 10, 6, 12, colors.khaki);
    if (e.mode === "food") {
      drawRect(e.x - 7, e.y - 17, 14, 4, "#f7f7f7");
      drawRect(e.x - 11, e.y, 4, 5, "#f7f7f7");
      drawRect(e.x + 7, e.y, 4, 5, "#f7f7f7");
    }
  }

  function drawCustomer(c) {
    drawRect(c.x - 7, c.y + 9, 15, 4, colors.shadow);
    drawRect(c.x - 5, c.y - 12, 10, 8, "#d9a26e");
    drawRect(c.x - 7, c.y - 4, 14, 14, c.color);
    drawRect(c.x - 6, c.y + 10, 5, 10, "#3a2a24");
    drawRect(c.x + 1, c.y + 10, 5, 10, "#3a2a24");
    drawWorldText(c.name, c.x, c.y - 22, "#21160e", 8);
  }

  function drawRobot(r) {
    drawRect(r.x - 12, r.y + 8, 24, 5, colors.shadow);
    drawRect(r.x - 13, r.y - 8, 26, 16, colors.greenRobot);
    drawRect(r.x - 8, r.y - 4, 16, 5, "#0f431d");
    drawRect(r.x - 5, r.y - 2, 3, 2, "#d9ff61");
    drawRect(r.x + 3, r.y - 2, 3, 2, "#d9ff61");
    drawRect(r.x - 11, r.y + 8, 6, 4, "#1b1b1b");
    drawRect(r.x + 5, r.y + 8, 6, 4, "#1b1b1b");
  }

  function drawEmployee(e) {
    drawRect(e.x - 7, e.y + 9, 15, 4, colors.shadow);
    drawRect(e.x - 5, e.y - 12, 10, 8, "#e0a77a");
    drawRect(e.x - 7, e.y - 4, 14, 14, colors.red);
    drawRect(e.x - 7, e.y + 10, 6, e.shorts ? 7 : 12, colors.khaki);
    drawRect(e.x + 1, e.y + 10, 6, e.shorts ? 7 : 12, colors.khaki);
    drawWorldText(e.name, e.x, e.y - 22, "#21160e", 8);
  }

  function drawMess(m) {
    drawRect(m.x - 8, m.y - 4, 16, 8, m.major ? "#5d3b1b" : colors.mess);
    drawRect(m.x - 3, m.y - 9, 7, 6, m.major ? "#7b5127" : "#6aa83c");
    if (m.major) drawWorldText("CODE BROWN", m.x, m.y - 14, "#5d1b1b", 8);
  }

  function drawBubbles() {
    const live = [
      adam,
      ...state.customers,
      ...state.employees,
    ].filter((e) => e.bubble && e.bubbleTime > 0);
    ctx.save();
    ctx.scale(pixelRatio(), pixelRatio());
    ctx.font = "700 13px Pixelify Sans, monospace";
    ctx.textAlign = "center";
    for (const e of live) {
      const p = screen(e.x, e.y - 38);
      const x = p.x / pixelRatio();
      const y = p.y / pixelRatio();
      const text = e.bubble;
      const w = Math.min(250, ctx.measureText(text).width + 16);
      drawBubbleBox(x - w / 2, y - 24, w, 22);
      ctx.fillStyle = "#fff1d1";
      ctx.fillText(text, x, y - 9, w - 10);
    }
    ctx.restore();
  }

  function drawBubbleBox(x, y, w, h) {
    ctx.fillStyle = "rgba(40,24,19,.94)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255,238,196,.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  }

  function updateHud() {
    hud.time.textContent = state.nowMinutes < 0 ? "OFF" : formatTime(state.nowMinutes);
    hud.phase.textContent = state.phase.name;
    hud.pressure.textContent = pressureLabel();
    hud.served.textContent = String(state.served);
    hud.customers.textContent = String(state.customers.length);
    hud.queue.textContent = String(state.customers.filter((c) => c.state === "queue").length);
    hud.task.textContent = state.checkout ? `Checking out ${state.checkout.customer.name}` : state.safeDropTimer > 0 ? "Safe drop: cash must be <= $75" : state.currentTask?.label || "Waiting";
    hud.resume.textContent = state.resumeLabel;
    hud.cashLabel.textContent = `$${Math.round(state.cash)}`;
    hud.cashMeter.value = Math.min(75, state.cash);
    hud.bodyLabel.textContent = `${Math.round(state.body)}%`;
    hud.bodyMeter.value = state.body;
    hud.cleanLabel.textContent = `${Math.round(state.clean)}%`;
    hud.cleanMeter.value = state.clean;
  }

  function startAudio() {
    if (state.audioStarted) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    state.audioStarted = true;
    if (!state.muted) startMusic();
    playSfx("robot");
  }

  function startMusic() {
    if (!audioCtx || musicTimer || state.muted) return;
    const notes = [196, 247, 262, 330, 294, 262, 247, 220, 196, 247, 330, 392, 330, 294, 247, 220];
    let i = 0;
    musicTimer = setInterval(() => {
      if (!audioCtx || state.muted) return;
      tone(notes[i % notes.length], 0.09, "square", 0.035);
      if (i % 4 === 0) tone(notes[(i + 5) % notes.length] / 2, 0.16, "triangle", 0.03);
      i++;
    }, 185);
  }

  function stopMusic() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  function tone(freq, duration = 0.08, type = "square", gainValue = 0.08) {
    if (!audioCtx || state.muted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainValue, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playSfx(kind) {
    if (!audioCtx || state.muted) return;
    if (kind === "door") {
      tone(880, 0.06, "square", 0.08);
      setTimeout(() => tone(1174, 0.08, "square", 0.06), 70);
    } else if (kind === "scan") tone(1320, 0.04, "square", 0.05);
    else if (kind === "cash") {
      tone(150, 0.05, "sawtooth", 0.05);
      setTimeout(() => tone(180, 0.05, "sawtooth", 0.04), 55);
    } else if (kind === "safe") tone(82, 0.18, "triangle", 0.12);
    else if (kind === "mess") tone(110, 0.12, "sawtooth", 0.07);
    else if (kind === "robot") {
      tone(660, 0.04, "square", 0.05);
      setTimeout(() => tone(990, 0.04, "square", 0.05), 45);
    }
  }

  function startGame(withAudio) {
    if (!state.started) {
      state.started = true;
      hud.shell.classList.add("is-started");
      addEvent("The Method boots. No freeform jazz.");
    }
    if (withAudio) startAudio();
  }

  // No start button: the sim auto-starts silently when the scene loads.
  // Chiptunes need a user gesture, so we arm audio on the first interaction.
  function bindControls() {
    function armAudio() {
      startAudio();
      window.removeEventListener("pointerdown", armAudio);
      window.removeEventListener("keydown", armAudio);
    }
    window.addEventListener("pointerdown", armAudio);
    window.addEventListener("keydown", armAudio);
  }

  let last = performance.now();
  function loop(t) {
    const dt = Math.min(0.08, (t - last) / 1000 || 0.016);
    last = t;
    if (state.started) update(dt);
    else {
      setPhaseFromClock();
      updateCamera();
      updateHud();
    }
    render();
    requestAnimationFrame(loop);
  }

  window.render_game_to_text = () =>
    JSON.stringify({
      coordinate_system: "origin top-left; x right; y down; units are world pixels",
      store: "Snacks & Stimulants",
      time: state.nowMinutes < 0 ? "off_shift" : formatTime(state.nowMinutes),
      phase: state.phase.id,
      task: state.currentTask?.label || null,
      adam: { x: Math.round(adam.x), y: Math.round(adam.y), mode: adam.mode },
      customers: state.customers.map((c) => ({ name: c.name, state: c.state, entrance: c.entrance.name, x: Math.round(c.x), y: Math.round(c.y) })),
      employees: state.employees.map((e) => ({ name: e.name, kind: e.kind, x: Math.round(e.x), y: Math.round(e.y) })),
      served: state.served,
      cash: Math.round(state.cash),
      body: Math.round(state.body),
      clean: Math.round(state.clean),
      queue: state.customers.filter((c) => c.state === "queue").length,
      audioStarted: state.audioStarted,
      muted: state.muted,
    });

  window.advanceTime = (ms) => {
    state.started = true;
    hud.shell.classList.add("is-started");
    state.simulatedOffsetMs += ms;
    const steps = Math.max(1, Math.round(ms / (1000 / 30)));
    for (let i = 0; i < steps; i++) update(1 / 30);
    render();
  };

  window.__SAS_STATE__ = state;

  resize();
  bindControls();
  for (let i = 0; i < 3; i++) hud.eventLog.appendChild(document.createElement("li"));
  setPhaseFromClock();
  setTaskFromIndex();
  startGame(false);
  requestAnimationFrame(loop);
  window.addEventListener("resize", resize);
})();
