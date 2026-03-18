import { Container } from "@/components/Container"

const user = "Aritra"

export const Dashboard = () => {
  return (
    
    <Container>
        <p className="md:text-2xl mb-20 border-b-2">Astra Dashboard</p>
        <h1 className="md:text-4xl">Welcome {user}, how can I help you today?</h1>
    </Container>
  )
}
