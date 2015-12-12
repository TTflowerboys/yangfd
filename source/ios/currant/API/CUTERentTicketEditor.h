//
//  CUTERentTicketEditor.h
//  currant
//
//  Created by Foster Yin on 12/12/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <BFTask.h>
#import "CUTETicket.h"

@interface CUTERentTicketEditor : NSObject

+ (instancetype)sharedInstance;

- (BFTask *)editTicketWithTicket:(CUTETicket *)ticket ticketParams:(NSDictionary *)ticketParams propertyParams:(NSDictionary *)propertyParams;

@end
