<?php

/**
 * Usage:
 * $message = 'My First Push Notification!';
 * $pushServer = new PushSerer();
 * $pushServer->pushToGoogle('REG-ID-HERE', $message);
 * $pushServer->pushToApple('DEVICE-TOKEN-HERE', $message);
 */
class PushServer
{
    private $googleApiKey = 'AIzaSyCGdOeYiszuyN7Q7hyKR4rk1rQcd1LYCYc';
    private $googleApiUrl = 'https://android.googleapis.com/gcm/send';

    private $appleApiUrl = 'ssl://gateway.sandbox.push.apple.com:2195';
    private $privateKey = 'ck.pem';
    private $privateKeyPassPhrase = 'YOUR-PRIVATE-KEY-PASSPHRASE-HERE';

    public function pushToGoogle($regId, $message)
    {
        $fields = array(
            'registration_ids' => $regId,
            'data' => array("message" => $message),
        );
        $headers = array(
            'Authorization: key=' . $this->googleApiKey,
            'Content-Type: application/json'
        );

        // Open connection
        $ch = curl_init();

        // Set the url, number of POST vars, POST data
        curl_setopt($ch, CURLOPT_URL, $this->googleApiUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));

        // Execute post
        $result = curl_exec($ch);
        // Close connection
        curl_close($ch);

        return $result;
    }

    public function pushToApple($deviceToken, $message)
    {
        $ctx = stream_context_create();
        stream_context_set_option($ctx, 'ssl', 'local_cert', $this->privateKey);
        stream_context_set_option($ctx, 'ssl', 'passphrase', $this->privateKeyPassPhrase);

        // Open a connection to the APNS server
        $fp = stream_socket_client(
            $this->appleApiUrl,
            $err,
            $errstr,
            60,
            STREAM_CLIENT_CONNECT | STREAM_CLIENT_PERSISTENT,
            $ctx);

        if (!$fp)
            exit("Failed to connect: $err $errstr" . PHP_EOL);

        echo 'Connected to APNS' . PHP_EOL;

        // Create the payload body
        $body['aps'] = array(
            'alert' => $message,
            'sound' => 'default',
            'badge' => +1
        );

        // Encode the payload as JSON
        $payload = json_encode($body);

        // Build the binary notification
        $msg = chr(0) . pack('n', 32) . pack('H*', $deviceToken) . pack('n', strlen($payload)) . $payload;

        // Send it to the server
        $result = fwrite($fp, $msg, strlen($msg));

        // Close the connection to the server
        fclose($fp);

        return $result;
    }
}