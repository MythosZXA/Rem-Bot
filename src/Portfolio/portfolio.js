import { FiPhone } from 'react-icons/fi'
import { CiLocationOn } from 'react-icons/ci'
import { MdEmail } from 'react-icons/md'
import { SlGlobe } from 'react-icons/sl'
const { useState, useEffect } = React;

function SideBar() {
	useEffect(() => {
		document.getElementById('home').checked = true;
	}, []);

	return(
		<div class="side-bar">
			<input type="radio" class="side-bar-home" id="home" name="selectedTab"/>
			<input type="radio" class="side-bar-about" id="about" name="selectedTab"/>
			<input type="radio" class="side-bar-services" id="services" name="selectedTab"/>
			<input type="radio" class="side-bar-portfolio" id="portfolio" name="selectedTab"/>
			<input type="radio" class="side-bar-contact" id="contact" name="selectedTab"/>
			<ul>
				<li>
					<label for="home">Home</label>
				</li>
				<hr/>
				<li>
					<label for="about">About</label>
				</li>
				<hr/>
				<li>
					<label for="services">Services</label>
				</li>
				<hr/>
				<li>
					<label for="portfolio">Portfolio</label>
				</li>
				<hr/>
				<li>
					<label for="contact">Contact</label>
				</li>
			</ul>
		</div>
	)
}

function PageHome() {
	return(
		<div class="page home">
			<div class="title">
				<h1>Home</h1>
			</div>
		</div>
	)
}

function PageAbout() {
	return(
		<div class="page about">
			<div class="title">
				<h1>About Me</h1>
			</div>
		</div>
	)
}

function PageServices() {
	return(
		<div class="page services">
			<div class="title">
				<h1>Services</h1>
			</div>
		</div>
	)
}

function PagePortfolio() {
	return(
		<div class="page portfolio">
			<div class="title">
				<h1>Portfolio</h1>
			</div>
		</div>
	)
}

function PageContact() {
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');

	async function sendMessage() {
		const res = await fetch('/message', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			body: JSON.stringify({
				chatName: 'Toan',
				message: `${name}\n${phone}\n${email}\n${message}`
			})
		});
		setName('');
		setPhone('');
		setEmail('');
		setMessage('');
	}

	return(
		<div class="page contact">
			<div class="title">
				<h1>Contact Me</h1>
			</div>
			<div class="section horizontal-around" id="divContacts">
				<div>
					<FiPhone size="28"/>
					<h2>Phone</h2>
					<h3>(512)629-8245</h3>
				</div>
				<div>
					<CiLocationOn size="28"/>
					<h2>Location</h2>
					<h3>Austin, Texas</h3>
					<h3>Frisco, Texas</h3>
				</div>
				<div>
					<MdEmail size="28"/>
					<h2>Email</h2>
					<h3>Toant14@gmail.com</h3>
				</div>
				<div>
					<SlGlobe size="28"/>
					<h2>Website</h2>
					<h3>Bot</h3>
				</div>
			</div>
			<div class="vertical">
				<h1>Send Me A Message</h1>
			</div>
			<div class="horizontal-around">
				<input type="text"
					placeholder="Name"
					value={name}
					onChange={event => setName(event.target.value)}
				/>
				<input type="text"
					placeholder="Phone"
					value={phone}
					onChange={event => setPhone(event.target.value)}
				/>
				<input type="text"
					placeholder="Email"
					value={email}
					onChange={event => setEmail(event.target.value)}
				/>
			</div>
			<textarea placeholder="Message"
				value={message}
				onChange={event => setMessage(event.target.value)}
			/>
			<button class="submit" onClick={sendMessage}>Send Message</button>
		</div>
	)
}

ReactDOM.render(
	<React.Fragment>
		<SideBar/>
		<PageHome/>
		<PageAbout/>
		<PageServices/>
		<PagePortfolio/>
		<PageContact/>
	</React.Fragment>,
	document.getElementById('root')
)