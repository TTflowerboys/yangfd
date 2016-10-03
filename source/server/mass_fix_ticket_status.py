from __future__ import print_function
from app import f_app


tickets = f_app.ticket.get(f_app.ticket.search({"user_id": {"$exists": True}}, per_page=-1))
ticket_len = len(tickets)
processed = 0

for ticket in tickets:
    processed += 1
    try:
        user = f_app.user.get(ticket["user_id"])
    except:
        print("Found broken ticket", ticket["id"], "removing...")
        f_app.ticket.update_set(ticket["id"], {"status": "deleted"})

    print("Tickets processed", processed, "/", ticket_len)


tickets = f_app.ticket.get(f_app.ticket.search({"property_id": {"$exists": True}}, per_page=-1))
ticket_len = len(tickets)
processed = 0

for ticket in tickets:
    processed += 1
    try:
        property = f_app.property.get(ticket["property_id"])
    except:
        print("Found broken ticket", ticket["id"], "removing...")
        f_app.ticket.update_set(ticket["id"], {"status": "deleted"})

    print("Tickets processed", processed, "/", ticket_len)
