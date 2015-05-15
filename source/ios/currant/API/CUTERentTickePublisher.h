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


@interface CUTERentTickePublisher : NSObject

+ (instancetype)sharedInstance;

- (BFTask *)createTicket:(CUTETicket *)ticket;

- (BFTask *)editTicketExcludeImage:(CUTETicket *)ticket;

- (BFTask *)editTicket:(CUTETicket *)ticket updateStatus:(void (^)(NSString *))updateStatus;

- (BFTask *)publishTicket:(CUTETicket *)ticket updateStatus:(void (^) (NSString *status))updateStatus;

- (BFTask *)deleteTicket:(CUTETicket *)ticket;

@end
