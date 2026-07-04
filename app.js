const STORAGE_KEY = "faculdade-kanban";

const initialState = {
  goal: "",
  blockers: "",
  tasks: [
    {
      id: crypto.randomUUID(),
      title: "Revisar conteudo da proxima aula",
      subject: "Faculdade",
      priority: "Media",
      due: "",
      column: "todo",
    },
    {
      id: crypto.randomUUID(),
      title: "Separar atividades que valem nota",
      subject: "Organizacao",
      priority: "Alta",
      due: "",
      column: "todo",
    },
    {
      id: crypto.randomUUID(),
      title: "Atualizar resumo da materia",
      subject: "Estudos",
      priority: "Baixa",
      due: "",
      column: "doing",
    },
  ],
};

const state = loadState();
const columns = ["todo", "doing", "done"];

const goalInput = document.querySelector("#goal");
const blockersInput = document.querySelector("#blockers");
const titleInput = document.querySelector("#task-title");
const subjectInput = document.querySelector("#task-subject");
const priorityInput = document.querySelector("#task-priority");
const dueInput = document.querySelector("#task-due");
const addButton = document.querySelector("#add-task");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

goalInput.value = state.goal;
blockersInput.value = state.blockers;

renderTasks();
setupTabs();

goalInput.addEventListener("input", () => {
  state.goal = goalInput.value;
  saveState();
});

blockersInput.addEventListener("input", () => {
  state.blockers = blockersInput.value;
  saveState();
});

addButton.addEventListener("click", addTask);

titleInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

document.querySelectorAll(".task-list").forEach((list) => {
  list.addEventListener("dragover", (event) => {
    event.preventDefault();
    list.classList.add("drag-over");
  });

  list.addEventListener("dragleave", () => {
    list.classList.remove("drag-over");
  });

  list.addEventListener("drop", (event) => {
    event.preventDefault();
    list.classList.remove("drag-over");
    const taskId = event.dataTransfer.getData("text/plain");
    moveTask(taskId, list.id);
  });
});

function addTask() {
  const title = titleInput.value.trim();

  if (!title) {
    titleInput.focus();
    return;
  }

  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    subject: subjectInput.value.trim() || "Geral",
    priority: priorityInput.value,
    due: dueInput.value,
    column: "todo",
  });

  titleInput.value = "";
  subjectInput.value = "";
  dueInput.value = "";
  priorityInput.value = "Alta";
  titleInput.focus();
  saveState();
  renderTasks();
}

function renderTasks() {
  columns.forEach((column) => {
    const list = document.querySelector(`#${column}`);
    list.innerHTML = "";

    state.tasks
      .filter((task) => task.column === column)
      .forEach((task) => list.appendChild(createTaskCard(task)));
  });
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card grid min-w-0 cursor-grab gap-2 rounded-md bg-soft-pink p-3.5";
  card.draggable = true;
  card.dataset.id = task.id;

  card.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", task.id);
  });

  const dueText = task.due ? formatDate(task.due) : "Sem prazo";

  card.innerHTML = `
    <div class="task-title min-w-0 break-words font-extrabold"></div>
    <div class="task-meta flex min-w-0 flex-wrap gap-1.5">
      <span class="pill max-w-full break-words rounded-full bg-white/70 px-2 py-1 text-xs font-extrabold text-[#5d3442]"></span>
      <span class="pill max-w-full break-words rounded-full bg-white/70 px-2 py-1 text-xs font-extrabold text-[#5d3442]"></span>
      <span class="pill max-w-full break-words rounded-full bg-white/70 px-2 py-1 text-xs font-extrabold text-[#5d3442]"></span>
    </div>
    <div class="task-actions grid grid-cols-3 gap-1.5">
      <button class="min-h-[32px] min-w-0 rounded border border-[#5d3442]/30 bg-white/50 px-1 text-xs font-bold sm:text-sm" type="button" data-action="back">Voltar</button>
      <button class="min-h-[32px] min-w-0 rounded border border-[#5d3442]/30 bg-white/50 px-1 text-xs font-bold sm:text-sm" type="button" data-action="delete">Excluir</button>
      <button class="min-h-[32px] min-w-0 rounded border border-[#5d3442]/30 bg-white/50 px-1 text-xs font-bold sm:text-sm" type="button" data-action="next">Avancar</button>
    </div>
  `;

  card.querySelector(".task-title").textContent = task.title;
  const pills = card.querySelectorAll(".pill");
  pills[0].textContent = task.priority;
  pills[1].textContent = task.subject;
  pills[2].textContent = dueText;

  card.querySelector('[data-action="delete"]').addEventListener("click", () => {
    state.tasks = state.tasks.filter((item) => item.id !== task.id);
    saveState();
    renderTasks();
  });

  card.querySelector('[data-action="back"]').addEventListener("click", () => {
    const index = columns.indexOf(task.column);
    if (index > 0) {
      moveTask(task.id, columns[index - 1]);
    }
  });

  card.querySelector('[data-action="next"]').addEventListener("click", () => {
    const index = columns.indexOf(task.column);
    if (index < columns.length - 1) {
      moveTask(task.id, columns[index + 1]);
    }
  });

  return card;
}

function moveTask(taskId, column) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  task.column = column;
  saveState();
  renderTasks();
}

function formatDate(value) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(initialState);

  try {
    return JSON.parse(saved);
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setupTabs() {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedTab = button.dataset.tab;

      tabButtons.forEach((item) => {
        const isActive = item.dataset.tab === selectedTab;
        item.classList.toggle("border-fiap", isActive);
        item.classList.toggle("text-fiap", isActive);
        item.classList.toggle("border-transparent", !isActive);
        item.classList.toggle("text-slate-500", !isActive);
      });

      tabPanels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.id !== `${selectedTab}-panel`);
      });
    });
  });
}
