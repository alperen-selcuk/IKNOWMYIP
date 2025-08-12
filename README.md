# I KNOW MY IP 🌐

![image](https://github.com/user-attachments/assets/7dc71af7-d8a0-4fb4-8416-fd5a087a723c)



> Now you know your IP address

I KNOW MY IP is a lightweight, user-friendly web application designed for quick and comprehensive IP address information retrieval. View your IP details instantly with a beautiful, responsive interface that works seamlessly in both browser and terminal environments.

**Live Demo:** [iknowmyip.com](https://iknowmyip.com)

![Screenshot](screenshot.png)

## ✨ Features

- **Instant IP Information**: View your IP address and related details immediately upon visiting the site
- **DNS Records Lookup**: Retrieve DNS records (A, MX, NS) for any domain
- **Port Scanner**: Check if specific ports are open on an IP address
- **Domain Resolver**: Resolve domains using custom DNS servers
- **Terminal Support**: Get just your IP address when using curl
- **Multi-language Support**: Available in English and Turkish
- **Responsive Design**: Works beautifully on mobile, tablet, and desktop
- **Copy Functionality**: One-click copying of your IP address

## 🚀 Usage

### Browser Access
Simply visit [iknowmyip.com](https://iknowmyip.com) to see your IP information in a user-friendly interface.

### Terminal Access (CLI)
To get just your IP address in the terminal, use any of these endpoints:

```bash
# Primary endpoint (recommended)
curl iknowmyip.com/ip

# Alternative endpoints
curl iknowmyip.com/myip
curl iknowmyip.com/getip
curl iknowmyip.com/plainip
```

All endpoints return your IP address as plain text:
```
31.145.161.76
```

### Using with other tools
```bash
# Store IP in variable
MY_IP=$(curl -s iknowmyip.com/ip)

# Use with wget
wget -qO- iknowmyip.com/ip

# Use with httpie
http -b iknowmyip.com/ip
```

## 💻 Development

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/iknowmyip.git
cd iknowmyip
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5000`

## 🏗️ Built With

- **Frontend**: React, TailwindCSS, shadcn/ui components
- **Backend**: Express.js
- **Build Tool**: Vite
- **Containerization**: Docker (optional)

## 🛡️ Privacy

- I KNOW MY IP does not store or log any IP address information
- All lookups and scans are performed in real-time
- No tracking cookies or analytics are used

## 🔧 API Endpoints

The application provides several API endpoints:

- `GET /api/ip` - Get your IP address information
- `GET /api/dns` - Lookup DNS records for a domain
- `POST /api/port-scan` - Check if a specific port is open
- `POST /api/dns-resolve` - Resolve a domain using custom DNS

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



---

Made with ❤️ by Hasan Alperen SELÇUK
