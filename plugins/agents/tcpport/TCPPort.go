package tcpport

import (
	"net"
	"time"

	"github.com/gansoi/gansoi/plugins"
)

func init() {
	plugins.RegisterAgent("tcpport", TCPPort{})
}

// TCPPort will connect to a tcp port and measure timing.
type TCPPort struct {
	Address string `json:"address" description:"The address to connect to (host:port)"`
}

// Check implements plugins.Agent.
func (t *TCPPort) Check(result plugins.AgentResult) error {
	start := time.Now()
	conn, err := net.Dial("tcp", t.Address)
	if err != nil {
		return err
	}

	// Measure the duration. This is the only check we for for now.
	result.AddValue("ConnectDuration", ms(time.Now().Sub(start)))

	// It doesn't make sense to measure close timing. Go returns without error
	// before the remote end acks.
	err = conn.Close()
	if err != nil {
		return err
	}

	return nil
}

// ms will convert a time.Duration to milliseconds.
func ms(d time.Duration) int64 {
	return ((d + time.Millisecond/2) / time.Millisecond).Nanoseconds()
}
