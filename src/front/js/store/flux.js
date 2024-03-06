const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			],
			user: null,
			token: null
		},
		actions: {
			// create a sign up function here that makes a (POST) fetch request to /sign in your backend
			// then you will need to make a button the nav bar to take you a to a sign up page
			// make the sign up page call this sign up function to create a user
			sync_Session_Token: () =>{
				const token= sessionStorage.getItem("token");
				if(token && token !== "" && token !== undefined){
					setStore({token:token})
				}
			},
			
			signup: async(email, password) => {
				let response = await fetch(process.env.BACKEND_URL + "/api/signup", 
				{
					method: "POST",
					headers: {
					  "Content-Type": "application/json",
					},
					body: JSON.stringify({
					  email: email,
					  password: password,
					}),
				})
				let data = await response.json()
				setStore({user: data})
			},	
			
			login:async(email, password) => {
				const options = {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(
						{
							email:email, 
							password:password
						}
					)
				}
				try{
					const response=await fetch(process.env.BACKEND_URL+"/api/token", options)
					if (response.status !== 200){
						alert("Error response code:", response.status)
						return false;
					}
					const data=await response.json()
					console.log("access token:", data)
					sessionStorage.setItem("token", data.access_token)
					setStore({token: data.access_token})
					return true
				}
				catch(error){
					console.log("Login error, please try again.")
				}
			},

			logout: () => {
				sessionStorage.removeItem("token")
				console.log("You are logged out.")
				setStore({
					token: null
				})
			}
			// you will also need to create a login function that you will use the /token route for
			// again you will need a button and page for this

			// lastly you need to create a private/profile page.
			// ask me for further detail when you get there
			
			
			
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},
			getMessage: async () => {
				try{
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				}catch(error){
					console.log("Error loading message from backend", error)
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			}
		}
	};
};

export default getState;
