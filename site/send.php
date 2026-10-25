<?php
// Handles the home page consultation form and emails it to the team.
declare(strict_types=1);

const TO_EMAIL = 'hi@pass-group.com.au';
const FROM_EMAIL = 'noreply@pass-group.com.au';
const ALLOWED_TYPES = ['Mobile app', 'Website or online store', 'Custom software', 'Help with existing software'];

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(['message' => $message]);
    exit;
}

function clean(string $key, int $maxLength): string
{
    $value = trim((string)($_POST[$key] ?? ''));
    $value = str_replace(["\r", "\0"], '', $value);
    return mb_substr($value, 0, $maxLength);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, 'Method not allowed');
}

// Honeypot: bots fill the hidden "website" field
if (clean('website', 200) !== '') {
    respond(200, 'Thanks');
}

$name = str_replace("\n", ' ', clean('name', 100));
$contact = str_replace("\n", ' ', clean('contact', 150));
$type = clean('type', 50);
$message = clean('message', 5000);

if ($name === '' || $contact === '' || $message === '') {
    respond(422, 'Please fill in all fields.');
}
if (!in_array($type, ALLOWED_TYPES, true)) {
    $type = 'Not specified';
}

$isEmail = filter_var($contact, FILTER_VALIDATE_EMAIL) !== false;

$subject = 'New enquiry: ' . $type . ' from ' . $name;
$body = "Name: {$name}\n"
    . "Contact: {$contact}\n"
    . "Needs: {$type}\n\n"
    . "Idea:\n{$message}\n\n"
    . '-- Sent from pass-group.com.au on ' . date('j M Y, g:i a');

$headers = [
    'From: Pass Group Website <' . FROM_EMAIL . '>',
    'Content-Type: text/plain; charset=utf-8',
];
if ($isEmail) {
    $headers[] = 'Reply-To: ' . $contact;
}

$sent = mail(TO_EMAIL, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers), '-f' . FROM_EMAIL);

if (!$sent) {
    respond(500, 'Could not send');
}
respond(200, 'Thanks');
