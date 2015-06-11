//
//  CUTETicketEditingListener.m
//  currant
//
//  Created by Foster Yin on 6/11/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETicketEditingListener.h"
#import "CUTETicket.h"

@interface CUTETicketEditingListener () {

    CUTEModelEditingListener *_propertyListener;

}

@end


@implementation CUTETicketEditingListener

+ (CUTETicketEditingListener *)createListenerAndStartListenMarkWithSayer:(MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *)sayer {
    CUTETicketEditingListener *listener = [CUTETicketEditingListener new];
    [listener startListenMarkWithSayer:sayer];
    return listener;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
        _propertyListener = [CUTEModelEditingListener new];
    }
    return self;
}


- (void)startListenMarkWithSayer:(MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *)sayer {
    [super startListenMarkWithSayer:sayer];
    [_propertyListener startListenMarkWithSayer:[(CUTETicket *)sayer property]];
}

- (void)stopListenMark {
    [super stopListenMark];
    [_propertyListener stopListenMark];
}

- (NSDictionary *)getSyncUserInfo {
    NSDictionary *ticketParams = self.getEditedParams;
    NSDictionary *propertyParams = _propertyListener.getEditedParams;

    NSMutableDictionary *userInfo = [NSMutableDictionary dictionaryWithObject:self.sayer forKey:@"ticket"];
    if (ticketParams) {
        [userInfo setObject:ticketParams forKey:@"ticketParams"];
    }
    if (propertyParams) {
        [userInfo setObject:propertyParams forKey:@"propertyParams"];
    }
    
    return userInfo;
}

@end
