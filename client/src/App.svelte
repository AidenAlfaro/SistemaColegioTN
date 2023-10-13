<script>
	import { onMount } from 'svelte';
  
	let username = '';
	let password = '';
	let classes = [];
	let showAddModal = false;
	let className = '';
	let loggedIn = false;
	let currentClass = null; 
	let editingEncargado = false;


	async function login() {
		const response = await fetch('http://localhost:3001/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		});

		const message = await response.text();
		
		if (message === "Welcome") {
			loggedIn = true;
			fetchClasses();
		} else {
			alert(message);
		}
	}

	async function fetchClasses() {
		const response = await fetch('http://localhost:3001/classes');
		classes = await response.json();
	}

	async function addClass() {
    if (!className) return;

    const classExists = classes.some(classItem => classItem.name.toLowerCase() === className.toLowerCase());

    if (classExists) {
        alert('Class with this name already exists!');
        return;
    }

    const response = await fetch('http://localhost:3001/classes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: className })
    });

    if (response.ok) {
        fetchClasses();  
    } else {
        const errMsg = await response.text();
        alert('Failed to add class. ' + errMsg);
    }
	}

	function logout() {
		loggedIn = false;
		username = '';
		password = '';
	}

	async function clearAllClasses() {
    if (!confirm('Are you sure you want to clear all classes? This action is irreversible.')) {
        return;
    }

    const response = await fetch('http://localhost:3001/classes', {
        method: 'DELETE',
    });

    const message = await response.text();
    if (response.ok) {
        fetchClasses();  // Reload the classes list after clearing
        alert('All classes cleared successfully');
    } else {
        alert('Failed to clear classes: ' + message);
    }
	}

	function openClassDetails(classItem) {
		currentClass = classItem;
	}

	function goBack() {
    	currentClass = null;
	}

	async function setEncargadoClase() {
    const response = await fetch(`http://localhost:3001/classes/${currentClass.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ encargado_clase: currentClass.encargado_clase })
    });

    if (response.ok) {
        editingEncargado = false;
        fetchClasses();
    } else {
        const errMsg = await response.text();
        alert('Failed to update encargado_clase. ' + errMsg);
    }
	}



</script>

{#if !loggedIn}
<main>
	<h1>Login</h1>
	<input bind:value={username} placeholder="Username" />
	<input type="password" bind:value={password} placeholder="Password" />
	<button on:click={login}>Login</button>
</main>
{:else if currentClass}
<h1>{currentClass.name}</h1>

{#if !currentClass.encargado_clase || editingEncargado}
	<input bind:value={currentClass.encargado_clase} placeholder="Encargado de Clase" />
	<button on:click={setEncargadoClase}>Submit</button>
{:else}
	{currentClass.encargado_clase}
	<button on:click={() => editingEncargado = true}>Change</button>
{/if}

<button on:click={goBack}>Back to Classes</button>
{:else}
<button on:click={logout} style="position: absolute; top: 10px; right: 10px;">Logout</button>
<button on:click={clearAllClasses}>Clear All Classes</button>
<h2>Classes</h2>
{#each classes as classItem}
	<button class="class-button" on:click={() => openClassDetails(classItem)}>{classItem.name}</button>
{/each}
<button on:click={() => showAddModal = true}>Add Class</button>

<!-- Add Class Modal -->
{#if showAddModal}
	<div class="modal">
		<input bind:value={className} placeholder="Class Name" />
		<button on:click={addClass} disabled={!className}>Submit</button>
		<button on:click={() => showAddModal = false}>Cancel</button>
	</div>
{/if}
{/if}


<style>
	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 20px;
		background-color: white;
		border: 1px solid #ddd;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}
	.class-button {
        margin: 5px;
        padding: 10px 15px;
        border: none;
        background-color: #606060;
        color: white;
        cursor: pointer;
        border-radius: 5px;
        transition: background-color 0.3s;
    }

    .class-button:hover {
        background-color: #dddddd;
    }
</style>
