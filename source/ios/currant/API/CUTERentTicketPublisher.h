//
//  CUTERentTickePublisher.h
//  currant
//
//  Created by Foster Yin on 4/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Bolts.h>
#import "CUTETicket.h"


@interface CUTERentTicketPublisher : NSObject

+ (instancetype)sharedInstance;

- (BFTask *)createTicket:(CUTETicket *)ticket;

- (BFTask *)editTicketWithTicket:(CUTETicket *)ticket ticketParams:(NSDictionary *)ticketParams propertyParams:(NSDictionary *)propertyParams;

- (BFTask *)uploadImages:(NSArray *)images updateStatus:(void (^) (NSString *status))updateStatus;

- (BFTask *)editTicket:(CUTETicket *)ticket updateStatus:(void (^)(NSString *))updateStatus;

- (BFTask *)publishTicket:(CUTETicket *)ticket updateStatus:(void (^) (NSString *status))updateStatus;

- (BFTask *)deleteTicket:(CUTETicket *)ticket;

- (BFTask *)syncTickets;

@end
